"""误报记忆与持续学习（2025 项目迁移版）。

从 2026 Security-Agent 项目迁移而来，适配攻防推演场景：
- 记忆写入：每次对抗回合写入攻击/防御决策
- 记忆检索：相似历史注入 prompt，同类决策不重复出现
- 上限：只保留最近 MAX_RECORDS 条
- fail-open：文件缺失/损坏/写入失败均安全降级
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class MemoryStore:
    MAX_RECORDS = 200

    def __init__(self, path: Optional[Path] = None):
        self.path = path or (
            Path(__file__).resolve().parent.parent / "data" / "triage_history.jsonl"
        )

    def append(self, record: dict) -> None:
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            entry = {
                "event_id": record.get("event_id", ""),
                "host": record.get("host", ""),
                "process": record.get("process", ""),
                "behavior": record.get("behavior", ""),
                "event_type": record.get("event_type", ""),
                "risk_level": record.get("risk_level", ""),
                "confidence": record.get("confidence", ""),
                "is_false_positive": bool(record.get("is_false_positive", False)),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
            with self.path.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
            self._trim()
        except Exception as exc:
            logger.warning("记忆写入失败（已忽略）: %s", exc)

    def search(self, event, top_k: int = 3) -> list[dict]:
        records = self._load()
        if not records:
            return []
        corpus_tokens = self._tokenize(
            f"{getattr(event, 'behavior', '')} {getattr(event, 'raw_log', '')}"
        )
        current_id = getattr(event, "id", "")
        ranked: list[tuple[int, dict]] = []
        for rec in records:
            if rec.get("event_id") == current_id:
                continue
            score = 0
            if rec.get("host") and rec.get("host") == getattr(event, "host", ""):
                score += 3
            if rec.get("process") and rec.get("process") == getattr(event, "process", ""):
                score += 2
            overlap = corpus_tokens & self._tokenize(rec.get("behavior", ""))
            score += min(len(overlap), 3)
            if score > 0:
                ranked.append((score, rec))
        ranked.sort(key=lambda row: -row[0])
        return [rec for _, rec in ranked[:top_k]]

    def clear(self) -> int:
        records = self._load()
        count = len(records)
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text("", encoding="utf-8")
        except Exception as exc:
            logger.warning("记忆清空失败: %s", exc)
            return 0
        return count

    def count(self) -> int:
        return len(self._load())

    def _trim(self) -> None:
        records = self._load()
        if len(records) <= self.MAX_RECORDS:
            return
        try:
            with self.path.open("w", encoding="utf-8") as fh:
                for rec in records[-self.MAX_RECORDS:]:
                    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
        except Exception as exc:
            logger.warning("记忆裁剪失败（已忽略）: %s", exc)

    def _load(self) -> list[dict]:
        if not self.path.exists():
            return []
        records = []
        try:
            for line in self.path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        except OSError:
            return []
        return records

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        import re

        tokens = set(re.findall(r"[a-zA-Z0-9_]+", text.lower()))
        for char in text:
            if "\u4e00" <= char <= "\u9fff":
                tokens.add(char)
        return tokens
