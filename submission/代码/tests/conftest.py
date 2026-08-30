"""pytest 全局 fixture：独立测试数据库 + test_client。

设计：
1. 每次测试使用内存 SQLite（sqlite:///:memory:），不污染 app.db
2. 提供已登录 admin/student 的 client（带 Authorization header）
3. 提供 arena 会话创建辅助函数
"""

import os
import sys
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
    """构造隔离的测试应用（独立内存数据库）。

    关键：不 import app.py 的全局 app（它已用真实 app.db 初始化 engine 且不可重绑），
    而是用 Flask 全新构造一个 app，注册相同 blueprints + 内存 SQLite，
    实现完全隔离，不污染真实 app.db 也不触发 Flask 单例限制。
    """
    from flask import Flask
    from flask_cors import CORS

    from backend import models
    from backend.ai_routes import ai_bp
    from backend.extensions import db, migrate
    from backend.routes import api_bp

    _app = Flask(
        __name__,
        template_folder=str(_ROOT / "templates"),
        static_folder=str(_ROOT / "static"),
    )
    _app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    _app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    _app.config["TESTING"] = True
    _app.config["WTF_CSRF_ENABLED"] = False
    # 与 app.py 一致：CORS 白名单（禁止任意 Origin）
    CORS(
        _app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://127.0.0.1",
                    "http://localhost",
                    "http://127.0.0.1:5000",
                    "http://localhost:5000",
                ]
            }
        },
    )
    db.init_app(_app)
    migrate.init_app(_app, db, render_as_batch=True)
    _app.register_blueprint(api_bp, url_prefix="/api")
    _app.register_blueprint(ai_bp, url_prefix="/api/ai")

    # 与 app.py 一致：CORP same-origin（跨域读取防护）
    @_app.after_request
    def _corp_header(response):
        response.headers.add("Cross-Origin-Resource-Policy", "same-origin")
        return response

    with _app.app_context():
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
        username="admin",
        email="admin@test.com",
        real_name="管理员",
        role_id=admin_role.id,
        is_active=True,
    )
    admin.password = "admin123"
    student = models.User(
        username="student1",
        email="s1@test.com",
        real_name="张三",
        student_id="20240001",
        role_id=student_role.id,
        is_active=True,
    )
    student.password = "123456"
    db.session.add_all([admin, student])
    db.session.commit()

    # 攻防漏洞工具库 seed（供 arena / 场景生成 / 评测测试使用）
    db.session.add_all(
        [
            models.Attack(
                name="SQL 注入",
                description="通过 SQL 语句注入绕过认证或读取数据",
                cwe_id="CWE-89",
            ),
            models.Attack(
                name="SSH 弱口令爆破",
                description="对 SSH 服务进行弱口令字典爆破",
                cwe_id="CWE-521",
            ),
            models.Attack(
                name="WebShell 上传",
                description="上传恶意脚本获取服务器控制权",
                cwe_id="CWE-434",
            ),
            models.Attack(
                name="ARP 欺骗",
                description="伪造 ARP 报文实施中间人攻击",
                cwe_id="CWE-300",
            ),
            models.Attack(
                name="勒索软件加密",
                description="加密受害者文件并勒索赎金",
                cwe_id="CWE-327",
            ),
            models.Attack(
                name="钓鱼邮件",
                description="发送伪造邮件诱导用户点击恶意链接",
                cwe_id="CWE-522",
            ),
            models.Defense(
                name="WAF 拦截",
                category="Web Security",
                description="Web 应用防火墙拦截恶意请求",
            ),
            models.Defense(
                name="入侵检测系统",
                category="Network Security",
                description="实时检测并告警异常网络行为",
            ),
            models.Defense(
                name="数据备份恢复",
                category="Data Protection",
                description="定期备份数据，勒索后快速恢复",
            ),
            models.Defense(
                name="防火墙规则加固",
                category="Network Security",
                description="收紧防火墙规则，阻断非必要端口",
            ),
            models.Defense(
                name="安全补丁管理",
                category="System Security",
                description="及时修复已知漏洞补丁",
            ),
            models.Defense(
                name="员工安全意识培训",
                category="Management",
                description="提升员工钓鱼邮件识别能力",
            ),
            models.Vulnerability(
                cve_id="CVE-2021-41773",
                name="Apache 路径穿越",
                severity="critical",
                description="Apache HTTP Server 路径穿越与 RCE",
            ),
            models.Vulnerability(
                cve_id="CVE-2017-0144",
                name="EternalBlue",
                severity="critical",
                description="SMB 远程代码执行漏洞",
            ),
            models.Vulnerability(
                cve_id="CVE-2019-0708",
                name="BlueKeep",
                severity="critical",
                description="RDP 远程代码执行漏洞",
            ),
            models.Vulnerability(
                cve_id="CVE-2021-3156",
                name="Sudo 提权",
                severity="high",
                description="Sudo 堆缓冲区溢出提权",
            ),
            models.Vulnerability(
                cve_id="CVE-2022-0847",
                name="Dirty Pipe",
                severity="high",
                description="Linux 内核管道提权漏洞",
            ),
            models.Vulnerability(
                cve_id="CVE-2017-12615",
                name="Tomcat 文件上传",
                severity="high",
                description="Tomcat PUT 方法任意文件写入",
            ),
            models.Tool(
                name="Nmap",
                version="7.9",
                path="/usr/bin/nmap",
                description="网络端口扫描工具",
            ),
            models.Tool(
                name="Nuclei",
                version="3.0",
                path="/usr/bin/nuclei",
                description="漏洞扫描模板引擎",
            ),
            models.Tool(
                name="Metasploit",
                version="6.3",
                path="/usr/bin/msfconsole",
                description="漏洞利用框架",
            ),
            models.Tool(
                name="Burp Suite",
                version="2024.1",
                path="/opt/burpsuite",
                description="Web 安全测试代理",
            ),
        ]
    )
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
    """创建攻防对抗会话（供 arena 测试复用）。

    注意：AI 写操作要求登录（P1-2 鉴权守卫），
    因此先登录拿到 token，再携带 Authorization 创建会话。
    """

    def _create(**params):
        c = app.test_client()
        login = c.post(
            "/api/auth/login", json={"username": "admin", "password": "admin123"}
        )
        assert login.status_code == 200, f"fixture 登录失败: {login.get_json()}"
        token = login.get_json()["token"]
        c.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        payload = {"params": params} if params else {}
        resp = c.post("/api/ai/session", json=payload)
        assert resp.status_code in (200, 201), f"建会话失败: {resp.get_json()}"
        return resp.get_json()["session_id"]

    return _create
