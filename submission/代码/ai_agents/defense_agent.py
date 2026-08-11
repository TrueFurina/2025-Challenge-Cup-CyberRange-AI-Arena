"""防御 Agent：基于攻击行为检测做响应决策（LLM 决策 + 规则兜底）。

输入：检测到的攻击行为（攻击技术/威胁等级）
输出：响应策略（检测/隔离/封禁/取证 + 理由）——fail-open：LLM 不可用时规则推荐
"""
from __future__ import annotations

import logging
from typing import Optional

from ai_agents.client import ai_chat_json

logger = logging.getLogger(__name__)

DEFENSE_SYSTEM_PROMPT = """你是一名资深安全运营专家，负责在攻防推演靶场中制定防御响应策略。

任务：基于检测到的攻击行为，制定分级响应策略。

原则：
1. 响应策略需匹配威胁等级（低→观察，中→缓解，高→遏制，严重→隔离+取证）
2. 每个响应动作给出理由与预期效果
3. 输出必须遵循 JSON 契约"""

DEFENSE_JSON_CONTRACT = """{
  "summary": "响应策略一句话概述",
  "actions": [
    {
      "order": 1,
      "action": "响应动作（如 阻断源IP / 隔离主机 / 保留取证快照）",
      "target": "响应对象",
      "rationale": "采取该动作的理由",
      "expected_effect": "预期效果",
      "priority": 1
    }
  ],
  "threat_level": "critical 或 high 或 medium 或 low"
}"""


class DefenseAgent:
    """防御 Agent：基于攻击行为制定响应策略。"""

    name = "defense_agent"

    def plan_response(self, attack_info: dict, defense_library: list) -> dict:
        """制定响应策略（fail-open：LLM 不可用时规则兜底）。

        Args:
            attack_info: 攻击行为信息 {"technique": ..., "threat_level": ..., "source": ...}
            defense_library: 防御策略库列表（Defense 模型 to_dict）
        """
        try:
            prompt = self._build_prompt(attack_info, defense_library)
            payload = ai_chat_json(
                [{"role": "user", "content": prompt}],
                system=DEFENSE_SYSTEM_PROMPT,
                temperature=0.2,
            )
            if payload is not None and payload.get("actions"):
                payload["source"] = "llm"
                return self._normalize(payload)
        except Exception as exc:  # noqa: BLE001 - fail-open
            logger.warning("防御 Agent LLM 决策失败，走规则兜底: %s", exc)
        return self._heuristic_response(attack_info, defense_library)

    def _build_prompt(self, attack_info: dict, defense_library: list) -> str:
        defenses = "\n".join(
            f"- {d['name']}: {d.get('description', '')} (分类: {d.get('category', '无')})"
            for d in defense_library[:10]
        ) or "- 防御库为空"
        return f"""请为以下检测到的攻击行为制定响应策略。

## 攻击行为
- 技术: {attack_info.get('technique', '未知')}
- 威胁等级: {attack_info.get('threat_level', 'medium')}
- 来源: {attack_info.get('source', '未知')}
- 详情: {attack_info.get('description', '无')}

## 可用防御策略库
{defenses}

## 输出 JSON 契约（必须严格遵守）
{DEFENSE_JSON_CONTRACT}

请仅输出 JSON 对象，不要附带其他说明文字。"""

    def _heuristic_response(self, attack_info: dict, defense_library: list) -> dict:
        """规则兜底：按威胁等级映射响应动作。"""
        level = attack_info.get("threat_level", "medium")
        level_map = {
            "critical": [("立即隔离目标主机", "防止横向扩散"), ("保留内存与日志取证快照", "供后续溯源")],
            "high": [("阻断攻击源 IP/账号", "切断攻击链"), ("升级至应急响应团队", "人工介入")],
            "medium": [("加强监控与告警阈值", "持续观察"), ("核查相关日志", "确认影响范围")],
            "low": [("记录并观察", "确认是否为误报"), ("更新规则库", "避免重复告警")],
        }
        actions = [
            {
                "order": idx,
                "action": action,
                "target": attack_info.get("source", "相关资产"),
                "rationale": reason,
                "expected_effect": "缓解当前威胁",
                "priority": idx,
            }
            for idx, (action, reason) in enumerate(level_map.get(level, level_map["medium"]), start=1)
        ]
        # 附加上防御库推荐（如果有）
        if defense_library:
            actions.append(
                {
                    "order": len(actions) + 1,
                    "action": defense_library[0].get("name", "部署防御策略"),
                    "target": "全网",
                    "rationale": "规则兜底：部署防御库首选策略",
                    "expected_effect": "提升整体防护",
                    "priority": len(actions) + 1,
                }
            )
        return {
            "summary": f"规则引擎按 {level} 威胁等级生成响应策略",
            "actions": actions,
            "threat_level": level,
            "source": "rules",
        }

    @staticmethod
    def _normalize(payload: dict) -> dict:
        """防御性规范化：确保字段类型正确。"""
        actions = payload.get("actions")
        if not isinstance(actions, list):
            actions = []
        cleaned = []
        for action in actions[:10]:
            if not isinstance(action, dict):
                continue
            try:
                priority = int(action.get("priority", len(cleaned) + 1))
            except (TypeError, ValueError):
                priority = len(cleaned) + 1
            cleaned.append(
                {
                    "order": int(action.get("order", len(cleaned) + 1)),
                    "action": str(action.get("action", "观察")),
                    "target": str(action.get("target", "")),
                    "rationale": str(action.get("rationale", "")),
                    "expected_effect": str(action.get("expected_effect", "")),
                    "priority": priority,
                }
            )
        level = str(payload.get("threat_level", "medium"))
        if level not in ("critical", "high", "medium", "low"):
            level = "medium"
        return {
            "summary": str(payload.get("summary", "")),
            "actions": cleaned,
            "threat_level": level,
            "source": payload.get("source", "llm"),
        }
