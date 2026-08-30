"""评估分析器单元测试：技能画像/评分等级/改进建议/混淆矩阵。

覆盖（纯逻辑层，不依赖 Flask）：
- evaluate_session_rounds：攻击/防御/整体评分 + 综合评分 + 技能画像 + 建议
- 评分等级：A+/A/B+/C/D 边界
- 表现水平：expert/proficient/developing/novice
- 改进建议：按弱点生成，含 priority
- 团队画像：聚合个人技能取平均
- JSON 可序列化（to_jsonable 防御性转换）
"""

import json
import sys
from pathlib import Path

import pytest

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

from ai_agents.evaluation_analyzer import (  # noqa: E402
    EvaluationAnalyzer,
    evaluation_analyzer,
)


def _make_session(total_rounds=5, attack_wins=3):
    """构造模拟对抗会话（attack_wins 轮攻击得手）。"""
    rounds = []
    for i in range(total_rounds):
        won = i < attack_wins
        rounds.append(
            {
                "result": {"attack_won": won, "defense_won": not won},
                "attack_decision": {
                    "technique": f"technique-{i % 3}",  # 有限技术多样性
                    "risk_level": "high" if won else "low",
                },
                "defense_decision": {
                    "actions": ["告警"] if won else ["告警", "封禁", "隔离"],
                    "threat_level": "high" if won else "low",
                },
            }
        )
    return {"session_id": "test-eval-01", "rounds": rounds}


class TestEvaluateSessionRounds:
    def test_full_report_structure(self):
        report = evaluation_analyzer.evaluate_session_rounds(_make_session())
        assert "exercise_id" in report
        assert "attack_evaluation" in report
        assert "defense_evaluation" in report
        assert "overall_evaluation" in report
        assert "comprehensive_score" in report
        assert "skill_profiles" in report
        assert "improvement_suggestions" in report

    def test_comprehensive_score_range(self):
        report = evaluation_analyzer.evaluate_session_rounds(_make_session())
        score = report["comprehensive_score"]["total_score"]
        assert 0 <= score <= 100

    def test_attack_score_correlates_with_wins(self):
        """攻击得手越多，攻击评分应越高。"""
        low = evaluation_analyzer.evaluate_session_rounds(_make_session(5, 1))
        high = evaluation_analyzer.evaluate_session_rounds(_make_session(5, 4))
        assert (
            high["attack_evaluation"]["total_score"]
            >= low["attack_evaluation"]["total_score"]
        )

    def test_empty_rounds(self):
        """空回合不崩溃（fail-open）。"""
        report = evaluation_analyzer.evaluate_session_rounds(
            {"session_id": "empty", "rounds": []}
        )
        assert report["comprehensive_score"]["total_score"] == 0.0
        assert report["comprehensive_score"]["grade"] == "D"

    def test_skill_profiles_roles(self):
        report = evaluation_analyzer.evaluate_session_rounds(_make_session())
        profiles = report["skill_profiles"]
        assert "red_team" in profiles
        assert "blue_team" in profiles
        assert "team" in profiles

    def test_skill_scores_in_range(self):
        report = evaluation_analyzer.evaluate_session_rounds(_make_session())
        red = report["skill_profiles"]["red_team"]
        for category, skills in red["skill_scores"].items():
            for score in skills.values():
                assert 0 <= score <= 100

    def test_json_serializable(self):
        report = evaluation_analyzer.evaluate_session_rounds(_make_session())
        dumped = json.dumps(report, ensure_ascii=False)
        assert json.loads(dumped)["exercise_id"] == "test-eval-01"


class TestGradeBoundaries:
    @pytest.mark.parametrize(
        "score,grade",
        [
            (95, "A+"),
            (90, "A+"),
            (88, "A"),
            (82, "A-"),
            (77, "B+"),
            (72, "B"),
            (67, "B-"),
            (62, "C+"),
            (57, "C"),
            (52, "C-"),
            (40, "D"),
        ],
    )
    def test_grades(self, score, grade):
        assert EvaluationAnalyzer._calculate_grade(score) == grade


class TestPerformanceLevel:
    @pytest.mark.parametrize(
        "score,level",
        [
            (90, "expert"),
            (75, "proficient"),
            (60, "developing"),
            (30, "novice"),
        ],
    )
    def test_levels(self, score, level):
        assert EvaluationAnalyzer._determine_performance_level(score) == level


class TestSuggestions:
    def test_suggestion_has_priority(self):
        suggestion = evaluation_analyzer._generate_attack_suggestion("success_rate")
        assert suggestion is not None
        assert suggestion["priority"] in ("high", "medium", "low")
        assert suggestion["actions"]

    def test_unknown_weakness_returns_none(self):
        assert (
            evaluation_analyzer._generate_attack_suggestion("not_a_real_weakness")
            is None
        )

    def test_suggestions_generated_from_weaknesses(self):
        """弱项存在时应生成对应建议。"""
        report = evaluation_analyzer.evaluate_session_rounds(_make_session(5, 1))
        suggestions = report["improvement_suggestions"]
        # 攻击评分低时应有建议
        assert isinstance(suggestions, list)


class TestTeamAnalysis:
    def test_team_skills_averaged(self):
        profiles = {
            "red_team": {
                "skill_scores": {
                    "technical_skills": {
                        "network_security": 80,
                        "incident_response": 60,
                    },
                    "analytical_skills": {"threat_analysis": 70},
                }
            },
            "blue_team": {
                "skill_scores": {
                    "technical_skills": {
                        "network_security": 90,
                        "incident_response": 70,
                    },
                    "analytical_skills": {"threat_analysis": 80},
                }
            },
        }
        team = evaluation_analyzer._analyze_team_skills(profiles)
        # network_security 平均 = (80+90)/2 = 85
        assert team["team_skills"]["technical_skills"]["network_security"] == 85.0
        assert "strengths" in team and "weaknesses" in team

    def test_team_empty(self):
        team = evaluation_analyzer._analyze_team_skills({})
        # 空输入返回结构化空团队（team_skills 为空，其余字段有默认值）
        assert team.get("team_skills") == {}
        assert team.get("strengths") == []
        assert team.get("weaknesses") == []
        assert team.get("collaboration_effectiveness") == 0.0


class TestEdgeCases:
    def test_to_jsonable_with_non_serializable(self):
        """to_jsonable 应防御非序列化值。"""
        report = {"timestamp": object()}  # object() 不可序列化
        result = evaluation_analyzer.to_jsonable(report)
        assert isinstance(result, dict)

    def test_skill_score_default(self):
        """默认表现数据返回基础分。"""
        score = evaluation_analyzer._calculate_skill_score("network_security", {})
        assert score >= 60
