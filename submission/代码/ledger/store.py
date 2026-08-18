"""Investigation Ledger 审计追踪（2025 项目迁移版）。

从 2026 Security-Agent 项目迁移而来，适配攻防推演场景：
- 完整记录每轮对抗的决策流（工具调用/预筛/LLM/后处理）
- 可回放、可审计、可导出 JSON
- fail-open：写入失败不阻断主链路
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class LedgerStore:
    def __init__(self, root: Optional[Path] = None):
        self.root = root or (
            Path(__file__).resolve().parent.parent / "data" / "ledger"
        )

    def begin(self, event_id: str, scenario: str = "") -> Optional["LedgerRecord"]:
        try:
            return LedgerRecord(store=self, event_id=event_id, scenario=scenario)
        except Exception as exc:
            logger.warning("Ledger 创建失败（已忽略）: %s", exc)
            return None

    def load(self, event_id: str) -> Optional[dict]:
        path = self.root / f"{event_id}.json"
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Ledger 加载失败: %s", exc)
            return None

    def list_event_ids(self) -> list[str]:
        if not self.root.exists():
            return []
        try:
            files = sorted(self.root.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
        except OSError:
            return []
        return [path.stem for path in files]


class LedgerRecord:
    def __init__(self, store: LedgerStore, event_id: str, scenario: str = ""):
        self.store = store
        self.event_id = event_id
        self.scenario = scenario
        self.started_at = datetime.utcnow().isoformat() + "Z"
        self.steps: list[dict] = []
        self.final_verdict: dict = {}
        self._llm_index = 0

    def record_step(self, phase: str, **fields) -> None:
        entry = {"phase": phase, "timestamp": datetime.utcnow().isoformat() + "Z"}
        entry.update(fields)
        self.steps.append(entry)

    def record_llm(self, prompt: str, response: str) -> None:
        self._llm_index += 1
        self.steps.append(
            {
                "phase": "llm",
                "llm_call": self._llm_index,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "llm_prompt": prompt[:2000],
                "llm_response": (response or "")[:2000],
            }
        )

    def finalize(self, verdict: dict) -> None:
        self.final_verdict = verdict
        try:
            self.store.root.mkdir(parents=True, exist_ok=True)
            payload = {
                "event_id": self.event_id,
                "scenario": self.scenario,
                "started_at": self.started_at,
                "finalized_at": datetime.utcnow().isoformat() + "Z",
                "steps": self.steps,
                "final_verdict": verdict,
            }
            path = self.store.root / f"{self.event_id}.json"
            path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        except Exception as exc:
            logger.warning("Ledger 落盘失败（已忽略）: %s", exc)
