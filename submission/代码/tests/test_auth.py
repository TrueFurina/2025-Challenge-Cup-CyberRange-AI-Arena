"""认证与鉴权测试：注册/登录/权限/提权防护回归。

覆盖：
- 注册：必填字段、用户名/邮箱/密码格式校验、强制 student 角色（防提权）
- 登录：成功签发 token、错误密码拒绝
- 鉴权：无 token 401、普通用户访问管理接口 403
- 提权防护回归：客户端传 role=admin 被忽略
"""

import pytest  # noqa: F401 - fixture 模式隐式使用


# ── 注册 ──────────────────────────────────────────────
class TestRegister:
    def test_register_success(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "new@test.com",
                "password": "pass123",
                "real_name": "新用户",
                "student_id": "20240099",
            },
        )
        assert resp.status_code in (200, 201), resp.get_json()
        body = resp.get_json()
        assert body.get("success") is True or "成功" in str(body.get("message", ""))

    def test_register_missing_field(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "nouser",
                "email": "x@test.com",
                "password": "pass123",
            },
        )
        assert resp.status_code == 400, resp.get_json()

    def test_register_invalid_username(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "1bad",  # 必须以字母开头
                "email": "x@test.com",
                "password": "pass123",
                "real_name": "测试",
            },
        )
        assert resp.status_code == 400

    def test_register_weak_password(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "weakpass",
                "email": "x@test.com",
                "password": "123",
                "real_name": "测试",
            },
        )
        assert resp.status_code == 400

    # P0 回归：客户端传 role 提权被忽略
    def test_register_role_escalation_blocked(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "username": "hacker1",
                "email": "h@test.com",
                "password": "pass123",
                "real_name": "黑客",
                "role": "admin",  # 恶意提权尝试
            },
        )
        assert resp.status_code in (200, 201)
        # 用新账号登录，验证角色不是 admin
        token_resp = client.post(
            "/api/auth/login",
            json={
                "username": "hacker1",
                "password": "pass123",
            },
        )
        token = token_resp.get_json().get("token")
        auth_client = client
        auth_client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        # 访问管理接口应被拒绝（403），证明不是 admin
        resp2 = auth_client.get("/api/users")
        assert resp2.status_code == 403, "提权攻击成功：新用户竟是 admin！"


# ── 登录 ──────────────────────────────────────────────
class TestLogin:
    def test_login_success(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "username": "admin",
                "password": "admin123",
            },
        )
        assert resp.status_code == 200, resp.get_json()
        assert resp.get_json().get("token"), "登录应签发 token"

    def test_login_wrong_password(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "username": "admin",
                "password": "wrong-pass",
            },
        )
        assert resp.status_code in (401, 400)

    def test_login_missing_user(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "username": "no_such_user",
                "password": "pass123",
            },
        )
        assert resp.status_code in (401, 400)


# ── 鉴权 ──────────────────────────────────────────────
class TestAuthz:
    def test_no_token_gets_401(self, client):
        resp = client.get("/api/users")
        assert resp.status_code == 401, "未登录访问管理接口应 401"

    def test_student_cannot_list_users(self, student_client):
        resp = student_client.get("/api/users")
        assert resp.status_code == 403, "普通用户访问用户列表应 403"

    def test_admin_can_list_users(self, admin_client):
        resp = admin_client.get("/api/users")
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), (list, dict))

    def test_student_cannot_delete_user(self, student_client):
        resp = student_client.delete("/api/users/1")
        assert resp.status_code == 403

    def test_admin_can_reset_password(self, admin_client):
        resp = admin_client.post("/api/users/2/reset-password")
        # 不强制断言 200（实现可能返回 404/200），但绝不能 401/403
        assert resp.status_code not in (401, 403), "admin 不应被拒"


# ── 登出/会话 ─────────────────────────────────────────
class TestSession:
    def test_invalid_token_rejected(self, app):
        c = app.test_client()
        c.environ_base["HTTP_AUTHORIZATION"] = "Bearer deadbeefdeadbeef"
        resp = c.get("/api/users")
        assert resp.status_code == 401, "伪造 token 应被拒绝"
