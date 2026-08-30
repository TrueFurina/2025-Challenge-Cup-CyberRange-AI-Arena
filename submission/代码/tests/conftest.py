"""pytest 全局 fixture：独立测试数据库 + test_client。

设计：
1. 每次测试使用内存 SQLite（sqlite:///:memory:），不污染 app.db
2. 提供已登录 admin/student 的 client（带 Authorization header）
3. 提供 arena 会话创建辅助函数
"""
import sys
import os
from pathlib import Path

import pytest

# 确保项目根目录在 sys.path（tests/ 的上级是 submission/代码/）
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

# 强制清空 LLM Key：测试必须走规则兜底（fail-open），绝不真实调用 LLM
# 注意：不能用 setdefault——本机可能已有 DEEPSEEK_API_KEY 环境变量，会导致测试真实调 API 而超时
os.environ["DEEPSEEK_API_KEY"] = ""


@pytest.fixture()
def app():
    """构造测试应用（独立内存数据库）。"""
    from app import app as _app

    # 切换到内存数据库（避免污染 app.db）
    _app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    _app.config["TESTING"] = True
    _app.config["WTF_CSRF_ENABLED"] = False

    from backend.extensions import db
    from backend import models

    with _app.app_context():
        db.drop_all()
        db.create_all()
        _seed_roles_and_users(db, models)

    yield _app

    with _app.app_context():
        db.session.remove()
        db.drop_all()


def _seed_roles_and_users(db, models):
    """创建测试角色与用户（admin/student）。"""
    admin_role = models.Role(name="admin")
    student_role = models.Role(name="student")
    teacher_role = models.Role(name="teacher")
    db.session.add_all([admin_role, student_role, teacher_role])
    db.session.commit()

    admin = models.User(
        username="admin", email="admin@test.com", real_name="管理员",
        role_id=admin_role.id, is_active=True,
    )
    admin.password = "admin123"
    student = models.User(
        username="student1", email="s1@test.com", real_name="张三",
        student_id="20240001", role_id=student_role.id, is_active=True,
    )
    student.password = "123456"
    db.session.add_all([admin, student])
    db.session.commit()


@pytest.fixture()
def client(app):
    """未登录 client。"""
    return app.test_client()


def _auth_client(app, username, password):
    """登录并返回带 token 的 client。"""
    c = app.test_client()
    resp = c.post("/api/auth/login", json={"username": username, "password": password})
    assert resp.status_code == 200, f"登录失败: {resp.get_json()}"
    token = resp.get_json()["token"]
    c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    return c


@pytest.fixture()
def admin_client(app):
    """已登录 admin 的 client。"""
    return _auth_client(app, "admin", "admin123")


@pytest.fixture()
def student_client(app):
    """已登录 student 的 client。"""
    return _auth_client(app, "student1", "123456")


@pytest.fixture()
def create_session(app):
    """创建攻防对抗会话（供 arena 测试复用）。"""
    def _create(**params):
        c = app.test_client()
        payload = {"params": params} if params else {}
        resp = c.post("/api/ai/session", json=payload)
        assert resp.status_code in (200, 201), f"建会话失败: {resp.get_json()}"
        return resp.get_json()["session_id"]

    return _create
