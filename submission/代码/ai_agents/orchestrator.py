"""攻击 vs 防御对抗编排器（回合制）。

编排 attack_agent 与 defense_agent 进行多轮攻防对抗：
- 攻击 Agent 规划攻击路径
- 防御 Agent 对攻击行为制定响应
- 每轮输出决策记录（思考/动作/结果/状态），供前端轮询展示
- fail-open：任一 Agent 失败降级，对抗不中断
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Any, Optional

from ai_agents.attack_agent import AttackAgent
from ai_agents.defense_agent import DefenseAgent
from memory import MemoryStore
from ledger import LedgerStore

logger = logging.getLogger(__name__)


class AgentArena:
    """攻防对抗编排器：维护对抗会话状态，支持多轮回合。"""

    MAX_ROUNDS = 5  # 最大回合数

    def __init__(self):
        self.attack_agent = AttackAgent()
        self.defense_agent = DefenseAgent()
        self.memory = MemoryStore()
        self.ledger = LedgerStore()
        self.sessions: dict[str, dict] = {}

    # ── 会话管理 ──────────────────────────────────────────
    def create_session(
        self,
        target_info: dict,
        attack_library: list,
        vulnerability_library: list,
        defense_library: list,
        params: Optional[dict] = None,
    ) -> dict:
        """创建攻防对抗会话（阶段 3 C3：支持动态环境参数）。

        params（可选）：
            target_count:    目标资产数量（默认 3，1-8）
            vuln_density:    漏洞密度/每主机漏洞数（默认 2，1-4）
            defense_strength: 防御强度等级 low/medium/high（默认 medium）
        """
        session_id = uuid.uuid4().hex[:12]
        params = params or {}
        try:
            target_count = max(1, min(int(params.get("target_count", 3)), 8))
        except (TypeError, ValueError):
            target_count = 3
        try:
            vuln_density = max(1, min(int(params.get("vuln_density", 2)), 4))
        except (TypeError, ValueError):
            vuln_density = 2
        defense_strength = str(params.get("defense_strength", "medium"))
        if defense_strength not in ("low", "medium", "high"):
            defense_strength = "medium"

        session = {
            "id": session_id,
            "target": target_info,
            "attack_library": attack_library,
            "vulnerability_library": vulnerability_library,
            "defense_library": defense_library,
            "rounds": [],
            "current_round": 0,
            "status": "ready",  # ready / running / finished
            "created_at": time.time(),
            "params": {
                "target_count": target_count,
                "vuln_density": vuln_density,
                "defense_strength": defense_strength,
            },
            # 阶段 3 迁移：实时态势数据 + 协调事件（agent_coordinator 独有能力）
            "real_time_data": {
                "attack_intensity": 0.0,
                "defense_effectiveness": 0.0,
                "threat_level": "low",
                "security_level": "low",
            },
            "coordination_history": [],
        }
        self.sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[dict]:
        return self.sessions.get(session_id)

    def list_sessions(self) -> list[dict]:
        return [
            {
                "id": s["id"],
                "status": s["status"],
                "current_round": s["current_round"],
                "created_at": s["created_at"],
                "params": s.get("params", {}),
            }
            for s in self.sessions.values()
        ]

    # ── 对抗执行 ──────────────────────────────────────────
    def run_round(self, session_id: str) -> dict:
        """执行一轮攻防对抗（fail-open：单 Agent 失败降级，对抗不中断）。

        流程：
        1. 攻击 Agent 基于目标与漏洞规划攻击路径
        2. 防御 Agent 基于攻击行为制定响应策略
        3. 记录本轮决策（attack_decision + defense_decision + 状态）
        """
        session = self.get_session(session_id)
        if session is None:
            return {"error": f"会话不存在: {session_id}"}
        if session["current_round"] >= self.MAX_ROUNDS:
            session["status"] = "finished"
            return {"session_id": session_id, "status": "finished", "message": "已达到最大回合数"}

        session["status"] = "running"
        round_no = session["current_round"] + 1

        # 本轮攻击目标（简单递增资产，可后续扩展为动态目标）
        target = dict(session["target"])
        if not target.get("name"):
            target["name"] = f"target-{round_no}"

        # 1) 攻击 Agent 规划
        attack_plan = self.attack_agent.plan_attack(
            target_info=target,
            attack_library=session["attack_library"],
            vulnerability_library=session["vulnerability_library"],
        )
        # 取攻击路径首步作为本轮"攻击行为"
        first_step = (attack_plan.get("steps") or [{}])[0]
        attack_behavior = {
            "technique": first_step.get("technique", "未知攻击"),
            "threat_level": attack_plan.get("risk_level", "medium"),
            "source": first_step.get("target", target.get("name", "未知")),
            "description": first_step.get("rationale", ""),
        }

        # 2) 防御 Agent 响应
        defense_plan = self.defense_agent.plan_response(
            attack_info=attack_behavior,
            defense_library=session["defense_library"],
        )

        # 3) 本轮结果判定（简单规则：攻击命中漏洞则攻击得手，否则防御成功）
        attack_won = bool(attack_plan.get("steps")) and attack_plan.get("source") != "error"
        defense_won = not attack_won or defense_plan.get("source") == "rules"

        round_record = {
            "round": round_no,
            "attack_decision": {
                "summary": attack_plan.get("summary", ""),
                "technique": first_step.get("technique", ""),
                "risk_level": attack_plan.get("risk_level", "medium"),
                "source": attack_plan.get("source", "rules"),
                "steps": attack_plan.get("steps", []),
            },
            "defense_decision": {
                "summary": defense_plan.get("summary", ""),
                "actions": defense_plan.get("actions", []),
                "threat_level": defense_plan.get("threat_level", "medium"),
                "source": defense_plan.get("source", "rules"),
            },
            "result": {
                "attack_won": attack_won,
                "defense_won": defense_won,
                "verdict": "攻击得手" if attack_won else "防御成功",
                "timestamp": time.time(),
            },
        }
        session["rounds"].append(round_record)
        session["current_round"] = round_no

        # 阶段 6：写入误报记忆（持久化本轮决策）
        self.memory.append({
            "event_id": session_id,
            "host": target.get("host", ""),
            "process": first_step.get("technique", ""),
            "behavior": attack_plan.get("summary", ""),
            "event_type": "攻击" if attack_won else "防御",
            "risk_level": attack_plan.get("risk_level", "medium"),
            "confidence": "high" if attack_plan.get("source") == "llm" else "medium",
            "is_false_positive": defense_won,
        })

        # 阶段 8：记录审计账本
        ledger_rec = self.ledger.begin(session_id, "攻防推演")
        if ledger_rec:
            ledger_rec.record_step("attack", technique=first_step.get("technique", ""), risk_level=attack_plan.get("risk_level", "medium"))
            ledger_rec.record_step("defense", actions=len(defense_plan.get("actions", [])), threat_level=defense_plan.get("threat_level", "medium"))
            ledger_rec.finalize({
                "round": round_no,
                "verdict": "攻击得手" if attack_won else "防御成功",
                "risk_level": attack_plan.get("risk_level", "medium"),
            })

        if round_no >= self.MAX_ROUNDS:
            session["status"] = "finished"
        else:
            session["status"] = "running"

        # 阶段 3 迁移：每轮对抗后更新实时态势 + 动态调整策略（自适应防御决策）
        try:
            self._update_situation(session)
            self._adjust_strategies(session)
        except Exception as exc:  # noqa: BLE001 - 态势更新失败不影响对抗主链路
            logger.warning("态势更新失败（已忽略）: %s", exc)

        return {
            "session_id": session_id,
            "round": round_record,
            "current_round": round_no,
            "max_rounds": self.MAX_ROUNDS,
            "status": session["status"],
            "real_time_data": session["real_time_data"],
        }

    def run_all(self, session_id: str) -> dict:
        """一次执行全部回合（供 API 一键对抗）。"""
        session = self.get_session(session_id)
        if session is None:
            return {"error": f"会话不存在: {session_id}"}
        results = []
        for _ in range(self.MAX_ROUNDS - session["current_round"]):
            results.append(self.run_round(session_id))
        return {
            "session_id": session_id,
            "rounds": session["rounds"],
            "current_round": session["current_round"],
            "status": session["status"],
        }

    # ── 阶段 3 迁移：实时态势感知 + 动态策略调整 ──────────────
    # 来源：programs/cyber_range_platform/src/ai_agents/agent_coordinator.py
    # 适配：基于回合记录（rounds）计算态势，不依赖多 Agent 线程

    def _calculate_attack_intensity(self, session: dict) -> float:
        """计算攻击强度（0-100）：攻击成功率×0.6 + 攻陷率×0.4。"""
        rounds = session.get("rounds", [])
        total = len(rounds)
        if not total:
            return 0.0
        attack_won = sum(1 for r in rounds if r.get("result", {}).get("attack_won"))
        success_rate = attack_won / max(total, 1)
        # 攻陷率近似：攻击得手的轮次占比（无真实系统列表，用攻击源覆盖近似）
        sources = {r.get("attack_decision", {}).get("technique", "") for r in rounds}
        compromise_rate = len(sources) / max(total, 1)
        intensity = (success_rate * 0.6 + compromise_rate * 0.4) * 100
        return min(intensity, 100.0)

    def _calculate_defense_effectiveness(self, session: dict) -> float:
        """计算防御效果（0-100）：防御成功率×100（无数据取 50）。"""
        rounds = session.get("rounds", [])
        total = len(rounds)
        if not total:
            return 50.0
        defense_won = sum(1 for r in rounds if r.get("result", {}).get("defense_won"))
        return min(defense_won / max(total, 1) * 100, 100.0)

    @staticmethod
    def _assess_threat_level(attack_intensity: float, defense_effectiveness: float) -> str:
        """评估威胁等级：攻击强度 - 防御效果 → very_low/low/medium/high/critical。"""
        threat_index = attack_intensity - defense_effectiveness
        if threat_index < -20:
            return "very_low"
        if threat_index < 0:
            return "low"
        if threat_index < 20:
            return "medium"
        if threat_index < 40:
            return "high"
        return "critical"

    def _calculate_security_level(self, session: dict) -> str:
        """计算安全等级：基于攻击得手率与威胁数。"""
        rounds = session.get("rounds", [])
        total = len(rounds)
        if not total:
            return "low"
        attack_won = sum(1 for r in rounds if r.get("result", {}).get("attack_won"))
        compromise_rate = attack_won / max(total, 1)
        if compromise_rate > 0.7:
            return "critical"
        if compromise_rate > 0.4:
            return "high"
        if compromise_rate > 0.2:
            return "medium"
        return "low"

    def _update_situation(self, session: dict) -> None:
        """更新实时态势数据（每轮对抗后调用）。"""
        attack_intensity = self._calculate_attack_intensity(session)
        defense_effectiveness = self._calculate_defense_effectiveness(session)
        threat_level = self._assess_threat_level(attack_intensity, defense_effectiveness)
        security_level = self._calculate_security_level(session)
        session["real_time_data"].update({
            "attack_intensity": round(attack_intensity, 2),
            "defense_effectiveness": round(defense_effectiveness, 2),
            "threat_level": threat_level,
            "security_level": security_level,
        })
        # 协调事件记录（阈值 30s 简化为每轮记录一次关键状态变化）
        self._record_coordination_event(session, "situation_analysis", {
            "attack_intensity": round(attack_intensity, 2),
            "defense_effectiveness": round(defense_effectiveness, 2),
            "threat_level": threat_level,
            "security_level": security_level,
        })

    def _record_coordination_event(self, session: dict, event_type: str, details: dict) -> None:
        """记录协调事件到 coordination_history。"""
        try:
            session["coordination_history"].append({
                "timestamp": time.time(),
                "event_type": event_type,
                "round": session["current_round"],
                "details": details,
            })
        except Exception as exc:  # noqa: BLE001 - 记录失败不影响主链路
            logger.warning("协调事件记录失败（已忽略）: %s", exc)

    def _adjust_strategies(self, session: dict) -> None:
        """动态调整策略（自适应防御决策核心）：
        - 威胁 high/critical → 升级防御强度
        - 威胁 very_low → 提示可增加攻击强度
        """
        threat_level = session["real_time_data"].get("threat_level", "low")
        defense_strength = session["params"].get("defense_strength", "medium")

        if threat_level in ("high", "critical") and defense_strength != "high":
            session["params"]["defense_strength"] = "high"
            self._record_coordination_event(session, "defense_escalated", {
                "reason": f"threat_level={threat_level}",
                "from": defense_strength,
                "to": "high",
            })
        elif threat_level == "very_low" and defense_strength != "low":
            session["params"]["defense_strength"] = "low"
            self._record_coordination_event(session, "defense_relaxed", {
                "reason": "threat_level=very_low",
                "from": defense_strength,
                "to": "low",
            })


# 全局单例（供 API 路由复用会话状态）
arena = AgentArena()
