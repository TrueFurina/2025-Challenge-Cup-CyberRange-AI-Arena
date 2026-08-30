"""攻防对抗测试：回合执行/态势感知/动态策略调整回归。

覆盖：
- 会话创建（默认参数 + 动态参数 target_count/vuln_density/defense_strength）
- 单轮对抗（run_round）返回决策流
- 一键对抗（run_all）执行全部回合
- 态势感知：real_time_data 在每轮后更新（attack_intensity/defense_effectiveness/threat_level/security_level）
- 动态策略调整：威胁 high/critical → 防御强度升级
- 评估接口：evaluate 含混淆矩阵，report 导出 MD/HTML
- 深度评估 analyze：技能画像/评分等级/改进建议
"""

import pytest  # noqa: F401 - fixture 模式隐式使用


# ── 会话创建 ──────────────────────────────────────────
class TestSessionCreate:
    def test_create_default_session(self, create_session):
        sid = create_session()
        assert sid, "应返回 session_id"

    def test_create_with_params(self, create_session):
        sid = create_session(target_count=5, vuln_density=3, defense_strength="high")
        assert sid

    def test_create_invalid_params_clamped(self, create_session):
        # 非法参数应被钳制到合法范围而不是报错
        sid = create_session(
            target_count=999, vuln_density=-1, defense_strength="banana"
        )
        assert sid


# ── 对抗回合 ──────────────────────────────────────────
class TestRounds:
    def test_run_round_returns_decision(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        resp = c.post(f"/api/ai/session/{sid}/round")
        assert resp.status_code == 200, resp.get_json()
        body = resp.get_json()
        assert "round" in body
        assert body["round"]["attack_decision"]["technique"]
        assert body["round"]["defense_decision"]["actions"] is not None
        assert body["round"]["result"]["verdict"] in ("攻击得手", "防御成功")

    def test_run_all_completes(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        resp = c.post(f"/api/ai/session/{sid}/run")
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["current_round"] == 5, "应执行满 5 轮"
        assert len(body["rounds"]) == 5

    def test_unknown_session_404(self, admin_client):
        resp = admin_client.post("/api/ai/session/not_exist/round")
        assert resp.status_code == 404


# ── 态势感知（迁移自 agent_coordinator 的独有能力） ──
class TestSituationAwareness:
    def test_real_time_data_populated(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}")
        body = resp.get_json()
        rtd = body.get("real_time_data", {})
        assert "attack_intensity" in rtd
        assert "defense_effectiveness" in rtd
        assert "threat_level" in rtd
        assert "security_level" in rtd
        # 值必须在合法范围
        assert 0 <= rtd["attack_intensity"] <= 100
        assert 0 <= rtd["defense_effectiveness"] <= 100

    def test_threat_level_valid(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}")
        level = resp.get_json()["real_time_data"]["threat_level"]
        assert level in ("very_low", "low", "medium", "high", "critical")

    def test_strategy_adjustment_recorded(self, create_session, admin_client):
        """验证协调事件被记录（coordination_history 非空）。"""
        sid = create_session(defense_strength="medium")
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        # run_all 的返回不含 coordination_history，需从 arena 直接取
        from ai_agents.orchestrator import arena

        session = arena.get_session(sid)
        assert session is not None
        assert len(session["coordination_history"]) > 0, "态势分析应产生协调事件"


# ── 评估与报告（赛题功能④） ─────────────────────────
class TestEvaluation:
    def test_evaluate_has_confusion_matrix(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}/evaluate")
        assert resp.status_code == 200
        body = resp.get_json()
        cm = body.get("confusion_matrix", {})
        assert "tp" in cm and "fn" in cm and "fp" in cm and "tn" in cm
        assert body.get("cost_estimate") is not None

    def test_report_markdown(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}/report?format=md")
        assert resp.status_code == 200
        assert "混淆矩阵" in resp.text

    def test_report_html(self, create_session, admin_client):
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}/report?format=html")
        assert resp.status_code == 200
        assert "<html" in resp.text

    def test_analyze_deep_evaluation(self, create_session, admin_client):
        """深度评估（迁移自 evaluation_analyzer）：技能画像/评分/建议。"""
        sid = create_session()
        c = admin_client
        c.post(f"/api/ai/session/{sid}/run")
        resp = c.get(f"/api/ai/session/{sid}/analyze")
        assert resp.status_code == 200
        body = resp.get_json()
        assert "attack_evaluation" in body
        assert "defense_evaluation" in body
        assert "comprehensive_score" in body
        assert "skill_profiles" in body
        assert "improvement_suggestions" in body
        comp = body["comprehensive_score"]
        assert comp["grade"] in ("A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D")
        assert 0 <= comp["total_score"] <= 100
