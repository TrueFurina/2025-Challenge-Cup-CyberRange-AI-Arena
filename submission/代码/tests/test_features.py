"""新增功能回归测试：LLM 重试 / 评估做实 / AI 鉴权守卫 / 监控 / seed 数据。

覆盖（A+ 增强后新增）：
- LLM client：指数退避重试（mock 失败 N 次后成功 / 全失败返回 None）
- 评估分析器：协作效果去固定值（好团队 > 差团队）
- AI 写操作鉴权守卫：未登录 401 / 登录 201 / 跨站 Origin 403 / GET 公开
- 系统监控：get_system_info / get_process_info fail-open
- seed 数据：攻击/防御/漏洞/工具库数量与结构
"""

import sys
from pathlib import Path

import pytest  # noqa: F401 - fixture 模式隐式使用

_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))


# ── LLM 重试机制（P1-4） ─────────────────────────────
class TestLLMRetry:
    def test_retry_success_after_failures(self, monkeypatch):
        """失败 1 次后成功：应触发重试并返回内容。"""
        from ai_agents import client as llm_client

        calls = {"n": 0}

        class FakeResp:
            def __init__(self, ok):
                self.ok = ok

            def raise_for_status(self):
                if not self.ok:
                    import requests

                    raise requests.ConnectionError("network down")

            def json(self):
                return {"choices": [{"message": {"content": "retry-success"}}]}

        def fake_post(url, json=None, headers=None, timeout=None):
            calls["n"] += 1
            if calls["n"] == 1:
                return FakeResp(ok=False)
            return FakeResp(ok=True)

        # requests/time 在 _post_chat 函数内 import，patch 全局模块属性即可生效
        import requests
        import time

        monkeypatch.setattr(requests, "post", fake_post)
        monkeypatch.setattr(time, "sleep", lambda s: None)

        settings = {"api_key": "test-key", "base_url": "http://fake/v1", "model": "m"}
        result = llm_client._post_chat(
            [{"role": "user", "content": "hi"}], settings, 0.1, 100
        )
        assert result == "retry-success"
        assert calls["n"] == 2, "应恰好调用 2 次（1 失败 + 1 成功）"

    def test_retry_exhausted_returns_none(self, monkeypatch):
        """全部失败：重试耗尽后返回 None（fail-open）。"""
        from ai_agents import client as llm_client

        calls = {"n": 0}

        class FakeResp:
            def raise_for_status(self):
                import requests

                raise requests.ConnectionError("always down")

            def json(self):
                return {}

        def fake_post(url, json=None, headers=None, timeout=None):
            calls["n"] += 1
            return FakeResp()

        import requests
        import time

        monkeypatch.setattr(requests, "post", fake_post)
        monkeypatch.setattr(time, "sleep", lambda s: None)

        settings = {"api_key": "test-key", "base_url": "http://fake/v1", "model": "m"}
        result = llm_client._post_chat(
            [{"role": "user", "content": "hi"}], settings, 0.1, 100
        )
        assert result is None
        assert calls["n"] == 3, "应尝试 3 次（1 原始 + 2 重试）"

    def test_no_api_key_fail_open(self, monkeypatch):
        """无 API Key 直接返回 None，不走网络。"""
        from ai_agents import client as llm_client

        monkeypatch.setattr("ai_agents.client.os.environ", {})
        assert llm_client.ai_chat([{"role": "user", "content": "hi"}]) is None


# ── 评估分析器做实（P1-5） ───────────────────────────
class TestCollaborationRealized:
    def test_good_team_scores_higher(self):
        """好团队（互补+覆盖高+弱点少）应显著高于差团队。"""
        from ai_agents.evaluation_analyzer import evaluation_analyzer as ea

        good = {
            "red_team": {
                "role": "red_team",
                "skill_scores": {
                    "technical_skills": {
                        "network_security": 85,
                        "penetration_testing": 90,
                    },
                    "analytical_skills": {"threat_analysis": 80},
                },
                "improvement_areas": [],
            },
            "blue_team": {
                "role": "blue_team",
                "skill_scores": {
                    "technical_skills": {"incident_response": 85, "threat_hunting": 88},
                    "analytical_skills": {"threat_analysis": 82},
                },
                "improvement_areas": [],
            },
        }
        bad = {
            "red_team": {
                "role": "red_team",
                "skill_scores": {"technical_skills": {"network_security": 30}},
                "improvement_areas": ["a", "b", "c"],
            }
        }
        assert ea._assess_collaboration_effectiveness(
            good
        ) > ea._assess_collaboration_effectiveness(bad)

    def test_empty_profiles_zero(self):
        from ai_agents.evaluation_analyzer import evaluation_analyzer as ea

        assert ea._assess_collaboration_effectiveness({}) == 0.0

    def test_skill_distribution_no_fixed_value(self):
        """技能分布应随输入变化（非固定 75/85）。"""
        from ai_agents.evaluation_analyzer import evaluation_analyzer as ea

        # 不同输入产生不同协作分（去固定值回归）
        a = ea._assess_collaboration_effectiveness(
            {
                "red_team": {
                    "role": "red_team",
                    "skill_scores": {
                        "technical_skills": {"network_security": 90},
                        "analytical_skills": {},
                    },
                    "improvement_areas": [],
                },
            }
        )
        b = ea._assess_collaboration_effectiveness(
            {
                "red_team": {
                    "role": "red_team",
                    "skill_scores": {
                        "technical_skills": {"network_security": 40},
                        "analytical_skills": {},
                    },
                    "improvement_areas": ["x", "y", "z", "w"],
                },
            }
        )
        assert a != b


# ── AI 写操作鉴权守卫（P1-2/3） ─────────────────────
class TestAIAuthGuard:
    def test_unauthenticated_create_session_401(self, app):
        c = app.test_client()
        resp = c.post("/api/ai/session", json={})
        assert resp.status_code == 401

    def test_authenticated_create_session_201(self, app):
        c = app.test_client()
        login = c.post(
            "/api/auth/login", json={"username": "admin", "password": "admin123"}
        )
        token = login.get_json().get("token")
        c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        resp = c.post("/api/ai/session", json={})
        assert resp.status_code == 201

    def test_csrf_origin_blocked(self, app):
        """非白名单 Origin 写操作被拒（CSRF 免疫）。"""
        c = app.test_client()
        login = c.post(
            "/api/auth/login", json={"username": "admin", "password": "admin123"}
        )
        token = login.get_json().get("token")
        c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        resp = c.post(
            "/api/ai/session", json={}, headers={"Origin": "http://evil.example.com"}
        )
        assert resp.status_code == 403

    def test_get_status_public(self, app):
        """GET 查询保持公开（评委体验）。"""
        c = app.test_client()
        resp = c.get("/api/ai/status")
        assert resp.status_code == 200

    def test_unauthenticated_run_round_401(self, app):
        c = app.test_client()
        resp = c.post("/api/ai/session/whatever/run")
        assert resp.status_code == 401


# ── 系统监控（fail-open） ────────────────────────────
class TestMonitoring:
    def test_get_system_info(self, app):
        from backend.monitoring import monitor

        info = monitor.get_system_info()
        assert isinstance(info, dict)
        assert "cpu" in info or "error" in info

    def test_get_process_info(self, app):
        from backend.monitoring import monitor

        result = monitor.get_process_info()
        assert isinstance(result, (list, dict))

    def test_perform_maintenance_unknown_task(self, app):
        from backend.monitoring import monitor

        result = monitor.perform_maintenance_task("no_such_task")
        assert result["success"] is False


# ── seed 数据完整性 ──────────────────────────────────
class TestSeedData:
    def test_seed_libraries_populated(self, app):
        """seed 后攻击/防御/漏洞/工具库应有数据（含 C1 场景生成所需）。"""
        from backend.models import Attack, Defense, Tool, Vulnerability

        with app.app_context():
            assert Attack.query.count() >= 5, "攻击库至少 5 条"
            assert Defense.query.count() >= 5, "防御库至少 5 条"
            assert Vulnerability.query.count() >= 5, "漏洞库至少 5 条"
            assert Tool.query.count() >= 3, "工具库至少 3 条"

    def test_vulnerability_structure(self, app):
        from backend.models import Vulnerability

        with app.app_context():
            vuln = Vulnerability.query.first()
            assert vuln is not None
            d = vuln.to_dict()
            assert "cve_id" in d or "name" in d
            assert "severity" in d

    def test_scenario_generation_from_seed(self, app):
        """基于漏洞库生成场景应产出主机拓扑。"""
        from backend.ai_routes import _generate_scenario
        from backend.models import Vulnerability

        with app.app_context():
            vulns = [v.to_dict() for v in Vulnerability.query.all()]
            if not vulns:
                pytest.skip("漏洞库为空，无法生成场景")
            scenario = _generate_scenario(vulns, target_count=3, vuln_density=2)
            assert scenario["total_hosts"] == 3
            assert len(scenario["hosts"]) == 3
            assert all("ip" in h and "services" in h for h in scenario["hosts"])
