import os

from flask import Flask, render_template
from flask_cors import CORS

from backend.extensions import db, migrate

app = Flask(__name__, template_folder="templates", static_folder="static")
# 安全修复（P1）：CORS 收紧为本地白名单，禁止任意 Origin 跨域调用（原为 origins: *）
CORS(
    app,
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

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "app.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize extensions with the app
db.init_app(app)
migrate.init_app(app, db, render_as_batch=True)

with app.app_context():
    from backend import models  # noqa: F401 - 注册模型到 SQLAlchemy metadata

    # 初始化数据库
    def init_db():
        """初始化数据库"""
        db.create_all()

        # 创建默认角色
        from backend.models import Role, User

        # 检查是否已有角色数据
        if Role.query.count() == 0:
            admin_role = Role(name="admin")
            student_role = Role(name="student")
            teacher_role = Role(name="teacher")

            db.session.add(admin_role)
            db.session.add(student_role)
            db.session.add(teacher_role)
            db.session.commit()
            print("默认角色创建完成")
        else:
            # 确保teacher角色存在
            if Role.query.filter_by(name="teacher").first() is None:
                db.session.add(Role(name="teacher"))
                db.session.commit()

        # 创建默认管理员账户
        if User.query.filter_by(username="admin").first() is None:
            admin_role = Role.query.filter_by(name="admin").first()
            admin_user = User(
                username="admin",
                email="admin@example.com",
                real_name="系统管理员",
                role_id=admin_role.id,
                is_active=True,
            )
            admin_user.password = "admin123"
            db.session.add(admin_user)
            db.session.commit()
            print("默认管理员账户创建完成 (admin/admin123)")

        # 创建测试学员账户
        student_role = Role.query.filter_by(name="student").first()
        test_students = [
            {
                "username": "student1",
                "email": "student1@example.com",
                "real_name": "张三",
                "student_id": "20240001",
            },
            {
                "username": "student2",
                "email": "student2@example.com",
                "real_name": "李四",
                "student_id": "20240002",
            },
            {
                "username": "test",
                "email": "test@example.com",
                "real_name": "测试用户",
                "student_id": "20240003",
            },
        ]

        for student_data in test_students:
            if User.query.filter_by(username=student_data["username"]).first() is None:
                student = User(
                    username=student_data["username"],
                    email=student_data["email"],
                    real_name=student_data["real_name"],
                    student_id=student_data["student_id"],
                    role_id=student_role.id,
                    is_active=True,
                )
                student.password = "123456"
                db.session.add(student)

        db.session.commit()
        print("测试学员账户创建完成")
        print("数据库初始化完成")

    # 初始化数据库
    init_db()

# Register blueprints
from backend.routes import api_bp

app.register_blueprint(api_bp, url_prefix="/api")

# Register AI agent blueprint (2025 项目 AI 集成)
from backend.ai_routes import ai_bp

app.register_blueprint(ai_bp, url_prefix="/api/ai")


# Dynamically create routes for all HTML files in the templates folder
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/<page_name>")
def show_page(page_name):
    if os.path.exists(os.path.join(app.template_folder, page_name)):
        return render_template(page_name)
    # Handle cases where page_name might not include .html extension
    elif os.path.exists(os.path.join(app.template_folder, f"{page_name}.html")):
        return render_template(f"{page_name}.html")
    return "Page not found", 404


@app.after_request
def after_request(response):
    # 安全修复（P1）：收紧跨域资源策略为 same-origin（原为 cross-origin，配合 CORS 全开放大攻击面）
    response.headers.add("Cross-Origin-Resource-Policy", "same-origin")
    return response


if __name__ == "__main__":
    # 安全修复（P0）：关闭 Flask debug 模式，避免 Werkzeug Debugger（含 PIN）暴露导致 RCE
    app.run(debug=False, host="127.0.0.1", port=5000)
