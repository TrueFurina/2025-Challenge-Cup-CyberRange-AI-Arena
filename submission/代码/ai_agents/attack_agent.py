"""攻击 Agent：自主规划攻击路径（LLM 决策 + 规则兜底）。

输入：目标资产信息（漏洞库/攻击库）
输出：攻击路径（技术选择 + 理由 + 置信度）——fail-open：LLM 不可用时规则推荐
"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

from ai_agents.client import ai_chat_json

logger = logging.getLogger(__name__)

ATTACK_SYSTEM_PROMPT = """你是一名拥有 15 年经验的攻击模拟专家，负责在攻防推演靶场中规划攻击路径。

任务：基于给定的目标资产与已知漏洞，规划一条合理的攻击路径。

原则：
1. 严格基于给定证据，禁止编造不存在的漏洞或技术
2. 攻击路径需符合真实攻击链（侦察 → 利用 → 提权 → 横向 → 影响）
3. 每个步骤给出技术依据与预期效果
4. 输出必须遵循 JSON 契约"""

ATTACK_JSON_CONTRACT = """{
  "summary": "攻击路径一句话概述",
  "steps": [
    {
      "order": 1,
      "technique": "攻击技术名称（如 SQL 注入 / 弱口令爆破）",
      "target": "目标资产/接口",
      "rationale": "选择该技术的理由",
      "expected_effect": "预期效果",
      "confidence": 0.8
    }
  ],
  "risk_level": "high 或 medium 或 low"
}"""


class AttackAgent:
    """攻击 Agent：基于目标资产规划攻击路径。"""

    name = "attack_agent"

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name

    def plan_attack(self, target_info: dict, attack_library: list, vulnerability_library: list) -> dict:
        """规划攻击路径（fail-open：LLM 不可用时规则兜底）。

        Args:
            target_info: 目标资产信息 {"name": ..., "os": ..., "services": [...]}
            attack_library: 攻击库列表（Attack 模型 to_dict）
            vulnerability_library: 漏洞库列表（Vulnerability 模型 to_dict）
        """
        try:
            prompt = self._build_prompt(target_info, attack_library, vulnerability_library)
            payload = ai_chat_json(
                [{"role": "user", "content": prompt}],
                system=ATTACK_SYSTEM_PROMPT,
                temperature=0.2,
            )
            if payload is not None and payload.get("steps"):
                payload["source"] = "llm"
                payload["confidence"] = payload.get("risk_level", "medium")
                return self._normalize(payload)
        except Exception as exc:  # noqa: BLE001 - fail-open
            logger.warning("攻击 Agent LLM 决策失败，走规则兜底: %s", exc)
        return self._heuristic_plan(target_info, attack_library, vulnerability_library)

    def _build_prompt(self, target_info: dict, attack_library: list, vulnerability_library: list) -> str:
        attacks = "\n".join(
            f"- {a['name']}: {a.get('description', '')} (CWE: {a.get('cwe_id', '无')})"
            for a in attack_library[:10]
        ) or "- 攻击库为空"
        vulns = "\n".join(
            f"- {v['name']}: {v.get('description', '')} (CVE: {v.get('cve_id', '无')}, 严重度: {v.get('severity', '无')})"
            for v in vulnerability_library[:10]
        ) or "- 漏洞库为空"
        return f"""请为以下目标规划攻击路径。

## 目标资产
- 名称: {target_info.get('name', '未知')}
- 系统: {target_info.get('os', '未知')}
- 开放服务: {', '.join(target_info.get('services', [])) or '未知'}

## 可用攻击技术库
{attacks}

## 已知漏洞库
{vulns}

## 输出 JSON 契约（必须严格遵守）
{ATTACK_JSON_CONTRACT}

请仅输出 JSON 对象，不要附带其他说明文字。"""

    def _heuristic_plan(self, target_info: dict, attack_library: list, vulnerability_library: list) -> dict:
        """规则兜底：按漏洞严重度优先推荐攻击技术（无 LLM 也能工作）。"""
        steps = []
        for idx, vuln in enumerate(vulnerability_library[:3], start=1):
            steps.append(
                {
                    "order": idx,
                    "technique": vuln.get("name", "漏洞利用"),
                    "target": target_info.get("name", "未知"),
                    "rationale": f"命中已知漏洞 {vuln.get('cve_id', '无 CVE')}，严重度 {vuln.get('severity', '未知')}",
                    "expected_effect": "尝试利用该漏洞获取访问权限",
                    "confidence": 0.7 if idx == 1 else 0.5,
                }
            )
        if not steps and attack_library:
            steps.append(
                {
                    "order": 1,
                    "technique": attack_library[0].get("name", "通用攻击"),
                    "target": target_info.get("name", "未知"),
                    "rationale": "规则兜底：选择攻击库第一项",
                    "expected_effect": "尝试执行该攻击技术",
                    "confidence": 0.4,
                }
            )
        return {
            "summary": "规则引擎兜底生成的攻击路径",
            "steps": steps or [
                {"order": 1, "technique": "端口扫描与指纹识别", "target": target_info.get("name", "未知"),
                 "rationale": "无已知漏洞，先进行侦察", "expected_effect": "获取开放服务信息", "confidence": 0.5}
            ],
            "risk_level": "high" if any(v.get("severity") in ("high", "critical") for v in vulnerability_library[:3]) else "medium",
            "source": "rules",
        }

    @staticmethod
    def _normalize(payload: dict) -> dict:
        """防御性规范化：确保字段类型正确。"""
        steps = payload.get("steps")
        if not isinstance(steps, list):
            steps = []
        cleaned = []
        for step in steps[:10]:
            if not isinstance(step, dict):
                continue
            try:
                confidence = float(step.get("confidence", 0.5))
            except (TypeError, ValueError):
                confidence = 0.5
            cleaned.append(
                {
                    "order": int(step.get("order", len(cleaned) + 1)),
                    "technique": str(step.get("technique", "未知技术")),
                    "target": str(step.get("target", "")),
                    "rationale": str(step.get("rationale", "")),
                    "expected_effect": str(step.get("expected_effect", "")),
                    "confidence": confidence,
                }
            )
        risk = str(payload.get("risk_level", "medium"))
        if risk not in ("high", "medium", "low"):
            risk = "medium"
        return {
            "summary": str(payload.get("summary", "")),
            "steps": cleaned,
            "risk_level": risk,
            "source": payload.get("source", "llm"),
        }
