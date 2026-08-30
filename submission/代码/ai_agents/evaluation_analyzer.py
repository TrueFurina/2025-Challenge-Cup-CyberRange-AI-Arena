"""演练评估分析器（迁移自 programs 早期版，适配 submission 项目）。

从 programs/cyber_range_platform/src/ai_agents/evaluation_analyzer.py 迁移而来，
删除 numpy/pandas/数据库依赖（纯标准库），输入改为 submission 的对抗会话结构：
    evaluate_session_rounds(session) -> dict
    - 技能画像（个人 + 团队）
    - 攻防表现评分（攻击/防御/整体）
    - 改进建议（攻击/防御/整体）
    - 评分等级（A+/A/A-/B+/B/B-/C+/C/C-/D）

赛题功能④「演练评估自动化」的深化实现。
"""
from __future__ import annotations

import json
import logging
from collections import defaultdict
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class EvaluationAnalyzer:
    """演练评估分析器：多维指标 + 技能画像 + 攻防分析 + 改进建议 + 评分等级。"""

    def __init__(self):
        self.evaluation_metrics = self._initialize_metrics()
        self.skill_framework = self._initialize_skill_framework()

    # ── 指标与框架 ──────────────────────────────────────
    def _initialize_metrics(self) -> Dict[str, Any]:
        """初始化评估指标（各维度带权重）。"""
        return {
            "attack_metrics": {
                "success_rate": {"weight": 0.3, "description": "攻击成功率"},
                "coverage": {"weight": 0.2, "description": "攻击覆盖面"},
                "stealth": {"weight": 0.2, "description": "攻击隐蔽性"},
                "efficiency": {"weight": 0.15, "description": "攻击效率"},
                "innovation": {"weight": 0.15, "description": "攻击创新性"},
            },
            "defense_metrics": {
                "detection_rate": {"weight": 0.25, "description": "威胁检测率"},
                "response_time": {"weight": 0.25, "description": "响应时间"},
                "containment": {"weight": 0.2, "description": "威胁遏制能力"},
                "recovery": {"weight": 0.15, "description": "恢复能力"},
                "collaboration": {"weight": 0.15, "description": "协作能力"},
            },
            "overall_metrics": {
                "scenario_completion": {"weight": 0.3, "description": "场景完成度"},
                "learning_objectives": {"weight": 0.25, "description": "学习目标达成"},
                "teamwork": {"weight": 0.2, "description": "团队协作"},
                "adaptability": {"weight": 0.15, "description": "适应能力"},
                "documentation": {"weight": 0.1, "description": "文档记录"},
            },
        }

    def _initialize_skill_framework(self) -> Dict[str, Any]:
        """初始化技能框架。"""
        return {
            "technical_skills": {
                "network_security": ["firewall_management", "ids_ips", "network_monitoring"],
                "system_security": ["os_hardening", "patch_management", "access_control"],
                "application_security": ["secure_coding", "vulnerability_assessment", "penetration_testing"],
                "incident_response": ["threat_hunting", "forensics", "malware_analysis"],
                "cryptography": ["encryption", "pki", "secure_communications"],
            },
            "analytical_skills": {
                "threat_analysis": ["threat_modeling", "risk_assessment", "intelligence_analysis"],
                "data_analysis": ["log_analysis", "pattern_recognition", "statistical_analysis"],
                "problem_solving": ["root_cause_analysis", "decision_making", "critical_thinking"],
            },
            "operational_skills": {
                "communication": ["reporting", "presentation", "stakeholder_management"],
                "project_management": ["planning", "coordination", "resource_management"],
                "compliance": ["regulatory_knowledge", "audit_preparation", "policy_development"],
            },
        }

    # ── 主入口（适配 submission 会话结构） ──────────────
    def evaluate_session_rounds(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """基于对抗会话的回合记录生成评估报告。

        Args:
            session: submission 的对抗会话（含 rounds 列表，每轮含
                     attack_decision/defense_decision/result）。
        Returns:
            评估报告：攻击/防御/整体评分 + 技能画像 + 改进建议 + 评分等级。
        """
        rounds = session.get("rounds", [])
        exercise_id = session.get("session_id", "unknown")
        logger.info("开始评估演练 %s（%d 轮）", exercise_id, len(rounds))

        # 从回合记录提取攻防数据
        attack_data = self._extract_attack_data(rounds)
        defense_data = self._extract_defense_data(rounds)

        # 计算各维度评分
        attack_scores = self._evaluate_attack_performance(attack_data)
        defense_scores = self._evaluate_defense_performance(defense_data)
        overall_scores = self._evaluate_overall_performance(rounds)

        # 综合评估 + 技能画像 + 改进建议
        comprehensive = self._generate_comprehensive_evaluation(
            attack_scores, defense_scores, overall_scores
        )
        skill_profiles = self._generate_skill_profiles(
            {"rounds": rounds, "attack_data": attack_data, "defense_data": defense_data}
        )
        suggestions = self._generate_improvement_suggestions(
            attack_scores, defense_scores, overall_scores
        )

        report = {
            "exercise_id": exercise_id,
            "total_rounds": len(rounds),
            "evaluation_timestamp": datetime.utcnow().isoformat() + "Z",
            "attack_evaluation": attack_scores,
            "defense_evaluation": defense_scores,
            "overall_evaluation": overall_scores,
            "comprehensive_score": comprehensive,
            "skill_profiles": skill_profiles,
            "improvement_suggestions": suggestions,
        }
        logger.info("演练 %s 评估完成，综合得分 %.2f", exercise_id, comprehensive["total_score"])
        return report

    # ── 数据提取（submission 回合 → 评估输入） ──────────
    @staticmethod
    def _extract_attack_data(rounds: List[Dict[str, Any]]) -> Dict[str, Any]:
        """从回合记录提取攻击评估数据。"""
        total = len(rounds)
        attack_won = sum(1 for r in rounds if r.get("result", {}).get("attack_won"))
        techniques = [
            r.get("attack_decision", {}).get("technique", "") for r in rounds
        ]
        distinct_techniques = len({t for t in techniques if t})
        return {
            "total_attacks": total,
            "successful_attacks": attack_won,
            "success_rate": round(attack_won / total, 3) if total else 0.0,
            "coverage_ratio": round(distinct_techniques / max(total, 1), 3),
            "techniques": techniques,
        }

    @staticmethod
    def _extract_defense_data(rounds: List[Dict[str, Any]]) -> Dict[str, Any]:
        """从回合记录提取防御评估数据。"""
        total = len(rounds)
        defense_won = sum(1 for r in rounds if r.get("result", {}).get("defense_won"))
        actions_total = sum(
            len(r.get("defense_decision", {}).get("actions", [])) for r in rounds
        )
        return {
            "total_defenses": total,
            "successful_defenses": defense_won,
            "success_rate": round(defense_won / total, 3) if total else 0.0,
            "avg_actions": round(actions_total / max(total, 1), 2),
            "total_actions": actions_total,
        }

    # ── 各维度评分 ──────────────────────────────────────
    def _evaluate_attack_performance(self, attack_data: Dict[str, Any]) -> Dict[str, Any]:
        """评估攻击表现（5 维度加权）。"""
        total = attack_data.get("total_attacks", 0)
        success_rate = attack_data.get("success_rate", 0.0)
        coverage = attack_data.get("coverage_ratio", 0.0)
        scores = {
            "success_rate": min(success_rate * 100, 100),
            "coverage": min(coverage * 100, 100),
            # 隐蔽性/效率/创新性：基于数据量的简化近似（无真实来源时取中性 70）
            "stealth": 70.0 if total else 0.0,
            "efficiency": min((1.0 - (total * 0.02)) * 100, 100) if total else 0.0,
            "innovation": 70.0 if total else 0.0,
        }
        weighted = sum(
            scores[k] * self.evaluation_metrics["attack_metrics"][k]["weight"]
            for k in scores
        )
        return {
            "scores": scores,
            "total_score": round(weighted, 2),
            "grade": self._calculate_grade(weighted),
            "strengths": [k for k, v in scores.items() if v >= 80],
            "weaknesses": [k for k, v in scores.items() if v < 60],
        }

    def _evaluate_defense_performance(self, defense_data: Dict[str, Any]) -> Dict[str, Any]:
        """评估防御表现（5 维度加权）。"""
        total = defense_data.get("total_defenses", 0)
        success_rate = defense_data.get("success_rate", 0.0)
        avg_actions = defense_data.get("avg_actions", 0.0)
        scores = {
            "detection_rate": min(success_rate * 100, 100),
            "response_time": min(max(100 - avg_actions * 5, 0), 100) if total else 0.0,
            "containment": min(success_rate * 100 + 10, 100) if total else 0.0,
            "recovery": 70.0 if total else 0.0,
            "collaboration": 70.0 if total else 0.0,
        }
        weighted = sum(
            scores[k] * self.evaluation_metrics["defense_metrics"][k]["weight"]
            for k in scores
        )
        return {
            "scores": scores,
            "total_score": round(weighted, 2),
            "grade": self._calculate_grade(weighted),
            "strengths": [k for k, v in scores.items() if v >= 80],
            "weaknesses": [k for k, v in scores.items() if v < 60],
        }

    def _evaluate_overall_performance(self, rounds: List[Dict[str, Any]]) -> Dict[str, Any]:
        """评估整体表现（基于对抗结果 + 回合数）。"""
        total = len(rounds)
        if not total:
            return {"scores": {}, "total_score": 0.0, "grade": "D",
                    "strengths": [], "weaknesses": []}
        attack_won = sum(1 for r in rounds if r.get("result", {}).get("attack_won"))
        scores = {
            "scenario_completion": 100.0,  # 全部回合执行完毕视为场景完成
            "learning_objectives": min(attack_won / total * 100 + 50, 100) if total else 0.0,
            "teamwork": 75.0,
            "adaptability": min(100 - (total * 3), 100) if total else 0.0,
            "documentation": 85.0,
        }
        weighted = sum(
            scores[k] * self.evaluation_metrics["overall_metrics"][k]["weight"]
            for k in scores
        )
        return {
            "scores": scores,
            "total_score": round(weighted, 2),
            "grade": self._calculate_grade(weighted),
            "strengths": [k for k, v in scores.items() if v >= 80],
            "weaknesses": [k for k, v in scores.items() if v < 60],
        }

    def _generate_comprehensive_evaluation(
        self, attack_scores: Dict[str, Any], defense_scores: Dict[str, Any],
        overall_scores: Dict[str, Any],
    ) -> Dict[str, Any]:
        """综合评估：攻击 40% + 防御 40% + 整体 20%。"""
        total = (
            attack_scores["total_score"] * 0.4
            + defense_scores["total_score"] * 0.4
            + overall_scores["total_score"] * 0.2
        )
        grade = self._calculate_grade(total)
        return {
            "total_score": round(total, 2),
            "grade": grade,
            "level": self._determine_performance_level(total),
            "evaluation_text": self._generate_evaluation_text(total, grade),
        }

    # ── 技能画像 ────────────────────────────────────────
    def _generate_skill_profiles(self, exercise_data: Dict[str, Any]) -> Dict[str, Any]:
        """生成技能画像（基于攻防角色的简化个人画像 + 团队画像）。"""
        attack_data = exercise_data.get("attack_data", {})
        defense_data = exercise_data.get("defense_data", {})

        # 红队画像（攻击侧）
        red_profile = self._analyze_individual_skills("red_team", {
            "attack_success_rate": attack_data.get("success_rate", 0.5),
            "overall_score": 0.0,
        })
        # 蓝队画像（防御侧）
        blue_profile = self._analyze_individual_skills("blue_team", {
            "defense_success_rate": defense_data.get("success_rate", 0.5),
            "overall_score": 0.0,
        })

        profiles = {"red_team": red_profile, "blue_team": blue_profile}
        profiles["team"] = self._analyze_team_skills(profiles)
        return profiles

    def _analyze_individual_skills(self, role: str, performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """分析个人技能（按角色确定技能重点）。"""
        if role == "red_team":
            focus_skills = ["network_security", "penetration_testing", "threat_analysis"]
        elif role == "blue_team":
            focus_skills = ["incident_response", "threat_hunting", "system_security"]
        else:
            focus_skills = ["network_security", "incident_response", "threat_analysis"]

        skill_scores = {}
        for category, skills in self.skill_framework.items():
            category_scores = {}
            for skill_area in skills:
                if skill_area in focus_skills:
                    category_scores[skill_area] = self._calculate_skill_score(skill_area, performance_data)
            skill_scores[category] = category_scores

        return {
            "role": role,
            "skill_scores": skill_scores,
            "strengths": self._identify_skill_strengths(skill_scores),
            "improvement_areas": self._identify_skill_improvements(skill_scores),
            "overall_skill_level": self._calculate_overall_skill_level(skill_scores),
        }

    def _analyze_team_skills(self, individual_profiles: Dict[str, Any]) -> Dict[str, Any]:
        """分析团队技能（聚合个人技能得分取平均）。"""
        aggregated = defaultdict(lambda: defaultdict(list))
        for profile in individual_profiles.values():
            if isinstance(profile, dict) and "skill_scores" in profile:
                for category, skills in profile["skill_scores"].items():
                    for skill, score in skills.items():
                        aggregated[category][skill].append(score)

        team_skills = {}
        for category, skills in aggregated.items():
            team_skills[category] = {
                skill: round(sum(scores) / len(scores), 1)
                for skill, scores in skills.items() if scores
            }

        return {
            "team_skills": team_skills,
            "strengths": self._identify_team_strengths(team_skills),
            "weaknesses": self._identify_team_weaknesses(team_skills),
            "collaboration_effectiveness": self._assess_collaboration_effectiveness(individual_profiles),
        }

    def _calculate_skill_score(self, skill_area: str, performance_data: Dict[str, Any]) -> float:
        """计算技能得分（0-100）。"""
        base = 60
        if skill_area == "penetration_testing":
            rate = performance_data.get("attack_success_rate", 0.5)
            return min(base + rate * 40, 100)
        if skill_area == "incident_response":
            rate = performance_data.get("defense_success_rate", 0.5)
            return min(base + rate * 40, 100)
        if skill_area == "threat_hunting":
            rate = performance_data.get("defense_success_rate", 0.5)
            return min(base + rate * 40, 100)
        if skill_area == "network_security":
            rate = performance_data.get("attack_success_rate", 0.5)
            return min(base + rate * 30, 100)
        return min(performance_data.get("overall_score", 70), 100)

    # ── 评分等级 ────────────────────────────────────────
    @staticmethod
    def _calculate_grade(score: float) -> str:
        """计算等级（A+/A/A-/B+/B/B-/C+/C/C-/D）。"""
        if score >= 90:
            return "A+"
        if score >= 85:
            return "A"
        if score >= 80:
            return "A-"
        if score >= 75:
            return "B+"
        if score >= 70:
            return "B"
        if score >= 65:
            return "B-"
        if score >= 60:
            return "C+"
        if score >= 55:
            return "C"
        if score >= 50:
            return "C-"
        return "D"

    @staticmethod
    def _determine_performance_level(score: float) -> str:
        if score >= 85:
            return "expert"
        if score >= 70:
            return "proficient"
        if score >= 55:
            return "developing"
        return "novice"

    @staticmethod
    def _generate_evaluation_text(score: float, grade: str) -> str:
        if score >= 90:
            return "优秀！演练表现卓越，各项指标均达到很高水平。"
        if score >= 80:
            return "良好！演练表现出色，大部分指标达到预期目标。"
        if score >= 70:
            return "中等！演练表现基本达标，仍有提升空间。"
        if score >= 60:
            return "及格！演练表现一般，需要重点改进多个方面。"
        return "不及格！演练表现不佳，需要全面提升能力。"

    # ── 改进建议 ────────────────────────────────────────
    def _generate_improvement_suggestions(
        self, attack_scores: Dict[str, Any], defense_scores: Dict[str, Any],
        overall_scores: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """生成改进建议（按攻击/防御/整体弱点）。"""
        suggestions = []
        for weakness in attack_scores.get("weaknesses", []):
            suggestion = self._generate_attack_suggestion(weakness)
            if suggestion:
                suggestions.append(suggestion)
        for weakness in defense_scores.get("weaknesses", []):
            suggestion = self._generate_defense_suggestion(weakness)
            if suggestion:
                suggestions.append(suggestion)
        for weakness in overall_scores.get("weaknesses", []):
            suggestion = self._generate_overall_suggestion(weakness)
            if suggestion:
                suggestions.append(suggestion)
        return suggestions

    @staticmethod
    def _generate_attack_suggestion(weakness: str) -> Optional[Dict[str, Any]]:
        suggestions_map = {
            "success_rate": {"title": "提高攻击成功率", "description": "建议加强漏洞研究和利用技术训练",
                             "actions": ["学习最新漏洞利用技术", "练习社会工程学攻击", "提升工具使用熟练度"], "priority": "high"},
            "coverage": {"title": "扩大攻击覆盖面", "description": "建议学习更多攻击向量和横向移动技术",
                         "actions": ["学习网络横向移动技术", "掌握多种初始访问方法", "提升目标侦察能力"], "priority": "medium"},
            "stealth": {"title": "提高攻击隐蔽性", "description": "建议学习反检测和规避技术",
                        "actions": ["学习反病毒规避技术", "掌握流量混淆方法", "提升痕迹清理能力"], "priority": "high"},
            "efficiency": {"title": "提高攻击效率", "description": "建议优化攻击路径规划与工具链",
                           "actions": ["精简攻击步骤", "使用自动化工具", "建立攻击模板库"], "priority": "medium"},
            "innovation": {"title": "提升攻击创新性", "description": "建议探索新型攻击手法",
                           "actions": ["研究 0day 技术", "组合攻击手法", "跟踪前沿研究"], "priority": "low"},
        }
        return suggestions_map.get(weakness)

    @staticmethod
    def _generate_defense_suggestion(weakness: str) -> Optional[Dict[str, Any]]:
        suggestions_map = {
            "detection_rate": {"title": "提高威胁检测能力", "description": "建议加强威胁狩猎和异常检测技能",
                               "actions": ["学习威胁狩猎技术", "提升日志分析能力", "掌握行为分析方法"], "priority": "high"},
            "response_time": {"title": "缩短响应时间", "description": "建议优化响应流程和自动化程度",
                              "actions": ["建立标准化响应流程", "提升工具自动化水平", "加强团队协作训练"], "priority": "high"},
            "containment": {"title": "提高威胁遏制能力", "description": "建议加强事件响应和隔离技术",
                            "actions": ["学习网络隔离技术", "掌握恶意软件清除方法", "提升系统恢复能力"], "priority": "medium"},
            "recovery": {"title": "提升恢复能力", "description": "建议完善业务连续性方案",
                         "actions": ["制定恢复演练计划", "建立备份机制", "验证恢复流程"], "priority": "medium"},
            "collaboration": {"title": "加强协同防御", "description": "建议提升跨团队协作效率",
                              "actions": ["建立共享情报机制", "统一响应流程", "定期联合演练"], "priority": "medium"},
        }
        return suggestions_map.get(weakness)

    @staticmethod
    def _generate_overall_suggestion(weakness: str) -> Optional[Dict[str, Any]]:
        suggestions_map = {
            "teamwork": {"title": "加强团队协作", "description": "建议提升团队沟通和协作效率",
                         "actions": ["建立有效沟通机制", "定期进行团队建设", "明确角色分工"], "priority": "medium"},
            "adaptability": {"title": "提高适应能力", "description": "建议加强应变能力和灵活性训练",
                             "actions": ["进行多场景演练", "学习快速决策方法", "提升压力下的表现"], "priority": "medium"},
        }
        return suggestions_map.get(weakness)

    # ── 辅助 ────────────────────────────────────────────
    @staticmethod
    def _identify_skill_strengths(skill_scores: Dict[str, Any]) -> List[str]:
        return [f"{cat}.{skill}" for cat, skills in skill_scores.items()
                for skill, score in skills.items() if score >= 80]

    @staticmethod
    def _identify_skill_improvements(skill_scores: Dict[str, Any]) -> List[str]:
        return [f"{cat}.{skill}" for cat, skills in skill_scores.items()
                for skill, score in skills.items() if score < 60]

    @staticmethod
    def _calculate_overall_skill_level(skill_scores: Dict[str, Any]) -> float:
        all_scores = [score for skills in skill_scores.values() for score in skills.values()]
        return round(sum(all_scores) / len(all_scores), 1) if all_scores else 0.0

    @staticmethod
    def _identify_team_strengths(team_skills: Dict[str, Any]) -> List[str]:
        return [f"{cat}.{skill}" for cat, skills in team_skills.items()
                for skill, score in skills.items() if score >= 80]

    @staticmethod
    def _identify_team_weaknesses(team_skills: Dict[str, Any]) -> List[str]:
        return [f"{cat}.{skill}" for cat, skills in team_skills.items()
                for skill, score in skills.items() if score < 60]

    @staticmethod
    def _assess_collaboration_effectiveness(individual_profiles: Dict[str, Any]) -> float:
        """评估协作效果（基于技能互补性，简化实现）。"""
        if not individual_profiles:
            return 0.0
        return 75.0

    @staticmethod
    def to_jsonable(report: Dict[str, Any]) -> Dict[str, Any]:
        """确保报告可 JSON 序列化（防御性转换）。"""
        return json.loads(json.dumps(report, ensure_ascii=False, default=str))


# 全局评估分析器实例
evaluation_analyzer = EvaluationAnalyzer()
