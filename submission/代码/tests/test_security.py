"""安全回归测试：越权/CORS/注入/配置安全。

覆盖（对应已修复的 9 个漏洞 + 新增回归）：
- 注册强制 student（提权防护）——已在 test_auth 覆盖，这里补 CORS/注入
- IDOR：用户 A 不能重置/删除用户 B
- CORS：跨域请求被白名单限制（Origin 校验）
- SQL 注入：登录/查询参数注入尝试不报错、不越权
- 路径穿越：模板路由 /<page_name> 不接受 ../ 逃逸
- 配置安全：debug 关闭（app.config TESTING 时不暴露）
- 未授权访问维护/监控接口（若存在）
"""

import pytest  # noqa: F401 - fixture 模式隐式使用


# ── IDOR 越权 ────────────────────────────────────────
class TestIDOR:
    def test_student_cannot_reset_admin_password(self, student_client):
        """student 重置 admin（id=1）密码应被拒。"""
        resp = student_client.post("/api/users/1/reset-password")
        assert resp.status_code == 403, "student 越权重置 admin 密码应 403"

    def test_student_cannot_delete_other(self, student_client):
        """student 删除他人应被拒。"""
        resp = student_client.delete("/api/users/3")
        assert resp.status_code == 403

    def test_unauth_cannot_access_monitoring(self, client):
        """未登录访问监控类接口应 401。"""
        for path in ("/api/monitoring", "/api/monitor", "/api/status"):
            resp = client.get(path)
            if resp.status_code != 404:  # 接口存在才断言鉴权
                assert resp.status_code in (401, 403), f"{path} 应要求鉴权"


# ── CORS ─────────────────────────────────────────────
class TestCORS:
    def test_whitelisted_origin_allowed(self, client):
        """白名单 Origin 应被允许。"""
        resp = client.get("/api/ai/status", headers={"Origin": "http://localhost:5000"})
        acao = resp.headers.get("Access-Control-Allow-Origin")
        assert acao in (None, "http://localhost:5000", "*"), f"ACAO 异常: {acao}"

    def test_foreign_origin_not_echoed(self, client):
        """非白名单 Origin 不应被回显（CORS 全开漏洞回归）。"""
        resp = client.get(
            "/api/ai/status", headers={"Origin": "http://evil.example.com"}
        )
        acao = resp.headers.get("Access-Control-Allow-Origin")
        assert acao != "*", "CORS 全开漏洞回归失败：任意 Origin 被允许"
        assert acao != "http://evil.example.com", "非白名单 Origin 被回显"

    def test_corp_same_origin(self, client):
        """CORP same-origin 头应存在（跨域读取防护）。"""
        resp = client.get("/")
        assert resp.headers.get("Cross-Origin-Resource-Policy") == "same-origin"


# ── SQL 注入 ─────────────────────────────────────────
class TestInjection:
    def test_login_sql_injection(self, client):
        """SQL 注入登录尝试不应成功。"""
        resp = client.post(
            "/api/auth/login",
            json={
                "username": "' OR '1'='1",
                "password": "' OR '1'='1",
            },
        )
        assert resp.status_code in (401, 400), "SQL 注入登录不应成功"

    def test_register_sql_injection(self, client):
        """注入字段注册应被格式校验拒绝或安全处理。"""
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "x' OR 1=1 --",
                "email": "a@b.com",
                "password": "pass123",
                "real_name": "注入",
            },
        )
        # 用户名格式校验应拒绝引号/空格
        assert resp.status_code == 400

    def test_username_special_chars_rejected(self, client):
        """用户名含 SQL 特殊字符应被拒绝（参数化 + 格式校验双保险）。"""
        for bad in ("admin'--", "a;DROP TABLE users;", 'a" OR "a"="a'):
            resp = client.post(
                "/api/auth/register",
                json={
                    "username": bad,
                    "email": "x@test.com",
                    "password": "pass123",
                    "real_name": "测试",
                },
            )
            assert resp.status_code == 400, f"非法用户名 {bad!r} 应被拒绝"


# ── 路径穿越 / 模板路由 ──────────────────────────────
class TestPathTraversal:
    def test_template_path_traversal(self, client):
        """模板路由拒绝 ../ 逃逸。"""
        for bad in ("../app.py", "../../etc/passwd", "%2e%2e/app.py"):
            resp = client.get(f"/{bad}")
            assert resp.status_code in (404, 400), f"路径穿越 {bad!r} 应被拒绝"


# ── 配置安全 ─────────────────────────────────────────
class TestConfigSecurity:
    def test_debug_not_exposed(self, app):
        """生产配置不应开启 debug（Werkzeug 调试器 RCE 回归）。"""
        assert app.debug is False, "debug 模式不应开启（RCE 风险）"

    def test_testing_flag(self, app):
        """测试模式下 TESTING=True（异常转 JSON 而非 500 页面泄露堆栈）。"""
        assert app.config.get("TESTING") is True


# ── 会话安全 ─────────────────────────────────────────
class TestSessionSecurity:
    def test_token_not_guessable(self, app):
        """token 应为随机十六进制（secrets.token_hex）。"""
        import re

        from backend.routes import _issue_token

        token = _issue_token(1)
        assert re.fullmatch(r"[0-9a-f]{32}", token), "token 应为 32 位十六进制"

    def test_register_role_field_ignored(self, client):
        """注册请求携带 role 字段时不会创建 admin（防提权回归）。"""
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "rolehack",
                "email": "rh@test.com",
                "password": "pass123",
                "real_name": "提权尝试",
                "role": "admin",
                "role_id": 1,
            },
        )
        assert resp.status_code in (200, 201)
        # 登录后访问用户列表应 403
        login = client.post(
            "/api/auth/login",
            json={
                "username": "rolehack",
                "password": "pass123",
            },
        )
        token = login.get_json().get("token")
        c = client
        c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        assert c.get("/api/users").status_code == 403, "提权攻击成功"
