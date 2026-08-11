from flask import Blueprint, jsonify, request, Response
from .extensions import db
from .models import Attack, Defense, Tool, Vulnerability, User, Role
from .monitoring import monitor
import time
import psutil
from collections import defaultdict
from datetime import datetime, timezone
import requests
import re

api_bp = Blueprint('api', __name__)

# 安全修复（P0）：轻量 token 会话机制（token -> user_id）
# 演示级实现：内存存储，重启失效；生产环境应改用 JWT + 持久化
import secrets
_active_tokens: dict = {}

def _issue_token(user_id: int) -> str:
    token = secrets.token_hex(16)
    _active_tokens[token] = user_id
    return token

def _current_user_id():
    """从 Authorization: Bearer <token> 提取当前用户；无效返回 None。"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth[len('Bearer '):].strip()
    return _active_tokens.get(token)

def _require_admin():
    """鉴权守卫：要求有效登录且为 admin；否则返回错误响应（或 None 表示通过）。"""
    uid = _current_user_id()
    if uid is None:
        return jsonify({'success': False, 'message': '未登录或会话已失效'}), 401
    user = User.query.get(uid)
    if user is None or not user.is_active:
        return jsonify({'success': False, 'message': '账户不可用'}), 401
    if getattr(user.role, 'name', '') != 'admin':
        return jsonify({'success': False, 'message': '需要管理员权限'}), 403
    return None

# 用户认证相关API
@api_bp.route('/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        
        # 验证必填字段
        required_fields = ['username', 'email', 'password', 'real_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'{field}不能为空'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        real_name = data['real_name'].strip()
        student_id = data.get('student_id', '').strip()
        phone = data.get('phone', '').strip()
        # 安全修复（P0）：强制注册角色为 student，禁止客户端传 role 提权为 admin/teacher
        role_name = 'student'
        
        # 验证用户名格式
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]{2,15}$', username):
            return jsonify({'success': False, 'message': '用户名必须以字母开头，3-16位字母数字下划线'}), 400
        
        # 验证邮箱格式
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'message': '邮箱格式不正确'}), 400
        
        # 验证密码强度
        if len(password) < 6:
            return jsonify({'success': False, 'message': '密码长度至少6位'}), 400
        
        # 验证学号格式（如果提供）
        if student_id and not re.match(r'^\d{8,12}$', student_id):
            return jsonify({'success': False, 'message': '学号必须是8-12位数字'}), 400
        
        # 验证手机号格式（如果提供）
        if phone and not re.match(r'^1[3-9]\d{9}$', phone):
            return jsonify({'success': False, 'message': '手机号格式不正确'}), 400
        
        # 检查用户名是否已存在
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': '用户名已存在'}), 400
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': '邮箱已被注册'}), 400
        
        # 检查学号是否已存在（如果提供）
        if student_id and User.query.filter_by(student_id=student_id).first():
            return jsonify({'success': False, 'message': '学号已被注册'}), 400
        
        # 获取/创建角色
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name)
            db.session.add(role)
            db.session.flush()
        
        # 创建新用户
        new_user = User(
            username=username,
            email=email,
            real_name=real_name,
            student_id=student_id if student_id else None,
            phone=phone if phone else None,
            role_id=role.id
        )
        new_user.password = password
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '注册成功',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'real_name': new_user.real_name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'注册失败: {str(e)}'}), 500

@api_bp.route('/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        
        username_or_email = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username_or_email or not password:
            return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400
        
        # 查找用户（支持用户名、邮箱、学号登录）
        user = None
        if '@' in username_or_email:
            user = User.query.filter_by(email=username_or_email.lower()).first()
        else:
            user = User.query.filter(
                (User.username == username_or_email) |
                (User.student_id == username_or_email)
            ).first()
        
        if not user or not user.verify_password(password):
            return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
        
        if not user.is_active:
            return jsonify({'success': False, 'message': '账户已被禁用'}), 401
        
        # 更新最后登录时间
        user.last_login = datetime.now()
        db.session.commit()
        
        # 安全修复（P0）：登录成功签发 token，供敏感接口鉴权
        token = _issue_token(user.id)
        
        return jsonify({
            'success': True,
            'message': '登录成功',
            'token': token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'登录失败: {str(e)}'}), 500

@api_bp.route('/auth/check-username', methods=['POST'])
def check_username():
    """检查用户名是否可用"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        
        if not username:
            return jsonify({'available': False, 'message': '用户名不能为空'})
        
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]{2,15}$', username):
            return jsonify({'available': False, 'message': '用户名必须以字母开头，3-16位字母数字下划线'})
        
        user_exists = User.query.filter_by(username=username).first()
        
        return jsonify({
            'available': not bool(user_exists),
            'message': '用户名已存在' if user_exists else '用户名可用'
        })
        
    except Exception as e:
        return jsonify({'available': False, 'message': f'检查失败: {str(e)}'})

@api_bp.route('/auth/check-email', methods=['POST'])
def check_email():
    """检查邮箱是否可用"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'available': False, 'message': '邮箱不能为空'})
        
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'available': False, 'message': '邮箱格式不正确'})
        
        user_exists = User.query.filter_by(email=email).first()
        
        return jsonify({
            'available': not bool(user_exists),
            'message': '邮箱已被注册' if user_exists else '邮箱可用'
        })
        
    except Exception as e:
        return jsonify({'available': False, 'message': f'检查失败: {str(e)}'})

# 用户管理API
@api_bp.route('/users', methods=['GET'])
def list_users():
    """获取用户列表，支持搜索、角色、状态筛选与分页"""
    # 安全修复（P1）：用户列表含敏感信息，仅管理员可见
    guard = _require_admin()
    if guard is not None:
        return guard
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        role_name = request.args.get('role', '', type=str).strip()
        status = request.args.get('status', '', type=str).strip()  # active/inactive

        query = User.query
        
        if search:
            like = f"%{search}%"
            query = query.filter(
                (User.username.ilike(like)) |
                (User.email.ilike(like)) |
                (User.real_name.ilike(like))
            )
        
        if role_name and role_name != 'all':
            role = Role.query.filter_by(name=role_name).first()
            if role:
                query = query.filter(User.role_id == role.id)
            else:
                # 如果角色不存在，返回空
                return jsonify({'success': True, 'users': [], 'total': 0, 'page': page, 'per_page': per_page, 'total_pages': 0})
        
        if status and status != 'all':
            if status == 'active':
                query = query.filter(User.is_active.is_(True))
            elif status == 'inactive':
                query = query.filter(User.is_active.is_(False))
        
        pagination = query.order_by(User.id.asc()).paginate(page=page, per_page=per_page, error_out=False)
        user_dicts = [u.to_dict() for u in pagination.items]
        
        return jsonify({
            'success': True,
            'users': user_dicts,
            'total': pagination.total,
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total_pages': pagination.pages
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'获取用户失败: {str(e)}'}), 500

@api_bp.route('/users', methods=['POST'])
def create_user():
    """管理员创建用户"""
    try:
        data = request.get_json()
        # 复用注册校验
        request_ctx = request
        return register()
    except Exception as e:
        return jsonify({'success': False, 'message': f'创建用户失败: {str(e)}'}), 500

@api_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """更新用户信息"""
    try:
        data = request.get_json()
        user = User.query.get_or_404(user_id)
        
        # 可更新字段
        if 'email' in data:
            email = data['email'].strip().lower()
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return jsonify({'success': False, 'message': '邮箱格式不正确'}), 400
            # 邮箱唯一性
            exists = User.query.filter(User.email == email, User.id != user_id).first()
            if exists:
                return jsonify({'success': False, 'message': '邮箱已被使用'}), 400
            user.email = email
        
        if 'real_name' in data:
            user.real_name = data['real_name'].strip()
        
        if 'phone' in data:
            phone = data['phone'].strip() if data['phone'] else None
            if phone and not re.match(r'^1[3-9]\d{9}$', phone):
                return jsonify({'success': False, 'message': '手机号格式不正确'}), 400
            user.phone = phone
        
        if 'role' in data:
            role = Role.query.filter_by(name=data['role']).first()
            if not role:
                role = Role(name=data['role'])
                db.session.add(role)
                db.session.flush()
            user.role_id = role.id
        
        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        
        db.session.commit()
        return jsonify({'success': True, 'message': '更新成功', 'user': user.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'更新失败: {str(e)}'}), 500

@api_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
def reset_user_password(user_id):
    """重置用户密码，若未提供new_password则使用默认随机密码"""
    # 安全修复（P0）：仅管理员可重置他人密码，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    try:
        data = request.get_json() or {}
        new_password = data.get('new_password')
        if not new_password:
            new_password = 'Temp' + datetime.now().strftime('%m%d%H%M')
        user = User.query.get_or_404(user_id)
        user.password = new_password
        db.session.commit()
        return jsonify({'success': True, 'message': '密码已重置', 'temp_password': new_password})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'重置失败: {str(e)}'}), 500

@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """删除用户"""
    # 安全修复（P0）：仅管理员可删除用户，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': '删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'删除失败: {str(e)}'}), 500

@api_bp.route('/attacks', methods=['GET'])
def get_attacks():
    attacks = Attack.query.all()
    return jsonify([attack.to_dict() for attack in attacks])

@api_bp.route('/attacks', methods=['POST'])
def add_attack():
    # 安全修复（P1）：数据写入仅管理员，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    data = request.get_json()
    new_attack = Attack(
        name=data['name'],
        description=data.get('description'),
        cwe_id=data.get('cwe_id')
    )
    db.session.add(new_attack)
    db.session.commit()
    return jsonify(new_attack.to_dict()), 201

@api_bp.route('/defenses', methods=['GET'])
def get_defenses():
    defenses = Defense.query.all()
    return jsonify([defense.to_dict() for defense in defenses])

@api_bp.route('/defenses', methods=['POST'])
def add_defense():
    # 安全修复（P1）：数据写入仅管理员，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    data = request.get_json()
    new_defense = Defense(
        name=data['name'],
        description=data.get('description'),
        category=data.get('category')
    )
    db.session.add(new_defense)
    db.session.commit()
    return jsonify(new_defense.to_dict()), 201

@api_bp.route('/tools', methods=['GET'])
def get_tools():
    tools = Tool.query.all()
    return jsonify([tool.to_dict() for tool in tools])

@api_bp.route('/tools', methods=['POST'])
def add_tool():
    # 安全修复（P1）：数据写入仅管理员，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    data = request.get_json()
    new_tool = Tool(
        name=data['name'],
        description=data.get('description'),
        version=data.get('version'),
        path=data.get('path')
    )
    db.session.add(new_tool)
    db.session.commit()
    return jsonify(new_tool.to_dict()), 201

@api_bp.route('/vulnerabilities', methods=['GET'])
def get_vulnerabilities():
    vulnerabilities = Vulnerability.query.all()
    return jsonify([vulnerability.to_dict() for vulnerability in vulnerabilities])

@api_bp.route('/vulnerabilities', methods=['POST'])
def add_vulnerability():
    # 安全修复（P1）：数据写入仅管理员，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    data = request.get_json()
    new_vulnerability = Vulnerability(
        name=data['name'],
        description=data.get('description'),
        cve_id=data.get('cve_id'),
        severity=data.get('severity')
    )
    db.session.add(new_vulnerability)
    db.session.commit()
    return jsonify(new_vulnerability.to_dict()), 201

# 监控相关API
@api_bp.route('/monitoring/system', methods=['GET'])
def get_system_info():
    """获取系统信息"""
    # 安全修复（P1）：系统信息敏感，仅管理员可见
    guard = _require_admin()
    if guard is not None:
        return guard
    return jsonify(monitor.get_system_info())

@api_bp.route('/monitoring/health', methods=['GET'])
def get_health_status():
    """获取健康检查状态"""
    return jsonify(monitor.check_service_health())

@api_bp.route('/monitoring/processes', methods=['GET'])
def get_process_info():
    """获取进程信息"""
    # 安全修复（P1）：进程信息敏感，仅管理员可见
    guard = _require_admin()
    if guard is not None:
        return guard
    return jsonify(monitor.get_process_info())

@api_bp.route('/monitoring/logs', methods=['GET'])
def get_system_logs():
    """获取系统日志"""
    # 安全修复（P1）：系统日志敏感，仅管理员可见
    guard = _require_admin()
    if guard is not None:
        return guard
    limit = request.args.get('limit', 50, type=int)
    return jsonify(monitor.get_system_logs(limit))

@api_bp.route('/monitoring/maintenance', methods=['POST'])
def perform_maintenance():
    """执行维护任务"""
    # 安全修复（P1）：仅管理员可触发维护任务，未登录/非 admin 拒绝
    guard = _require_admin()
    if guard is not None:
        return guard
    data = request.get_json() or {}
    task_type = data.get('task_type')
    
    if not task_type:
        return jsonify({'success': False, 'message': '缺少任务类型参数'}), 400
    # 安全修复（P1）：task_type 白名单，禁止任意字符串
    allowed_tasks = {'restart_services', 'backup_database', 'cleanup_temp'}
    if task_type not in allowed_tasks:
        return jsonify({'success': False, 'message': '未知的维护任务类型'}), 400
    
    result = monitor.perform_maintenance_task(task_type)
    return jsonify(result)

# Prometheus指标收集
request_count = defaultdict(int)
request_duration = defaultdict(list)

@api_bp.route('/monitoring/metrics')
def metrics():
    """Prometheus指标端点"""
    try:
        # 系统指标
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # 生成Prometheus格式的指标
        metrics_data = []
        
        # 系统指标
        metrics_data.append(f'# HELP system_cpu_percent CPU使用率')
        metrics_data.append(f'# TYPE system_cpu_percent gauge')
        metrics_data.append(f'system_cpu_percent {cpu_percent}')
        
        metrics_data.append(f'# HELP system_memory_percent 内存使用率')
        metrics_data.append(f'# TYPE system_memory_percent gauge')
        metrics_data.append(f'system_memory_percent {memory.percent}')
        
        metrics_data.append(f'# HELP system_disk_percent 磁盘使用率')
        metrics_data.append(f'# TYPE system_disk_percent gauge')
        metrics_data.append(f'system_disk_percent {disk.percent}')
        
        # 应用指标
        metrics_data.append(f'# HELP flask_requests_total 请求总数')
        metrics_data.append(f'# TYPE flask_requests_total counter')
        for endpoint, count in request_count.items():
            metrics_data.append(f'flask_requests_total{{endpoint="{endpoint}"}} {count}')
        
        # 数据库指标
        try:
            attack_count = Attack.query.count()
            defense_count = Defense.query.count()
            tool_count = Tool.query.count()
            vuln_count = Vulnerability.query.count()
            
            metrics_data.append(f'# HELP database_records_total 数据库记录总数')
            metrics_data.append(f'# TYPE database_records_total gauge')
            metrics_data.append(f'database_records_total{{table="attacks"}} {attack_count}')
            metrics_data.append(f'database_records_total{{table="defenses"}} {defense_count}')
            metrics_data.append(f'database_records_total{{table="tools"}} {tool_count}')
            metrics_data.append(f'database_records_total{{table="vulnerabilities"}} {vuln_count}')
        except Exception:
            pass
        
        return Response('\n'.join(metrics_data), mimetype='text/plain')
    except Exception as e:
        return Response(f'# 指标收集错误: {str(e)}', mimetype='text/plain')

@api_bp.route('/competitions/time', methods=['GET'])
def get_competition_time():
    """获取比赛时间数据 - 模拟从官方API获取真实时间"""
    try:
        # 获取服务器当前时间（UTC）
        server_time = datetime.now(timezone.utc)
        
        # 模拟比赛数据（实际应用中这些数据应该从数据库或外部API获取）
        competitions = [
            {
                'id': 1,
                'name': '全国大学生信息安全竞赛',
                'startTime': '2025-03-01T09:00:00Z',
                'endTime': '2025-03-03T18:00:00Z',
                'timezone': 'Asia/Shanghai',
                'official_url': 'https://www.ciscn.cn/'
            },
            {
                'id': 2,
                'name': '"巅峰极客"网络安全技能挑战赛',
                'startTime': '2025-01-15T10:00:00Z',
                'endTime': '2025-01-17T20:00:00Z',
                'timezone': 'Asia/Shanghai',
                'official_url': 'https://www.ichunqiu.com/battalion'
            },
            {
                'id': 3,
                'name': 'CTF线上夺旗赛',
                'startTime': '2024-12-20T14:00:00Z',
                'endTime': '2024-12-22T22:00:00Z',
                'timezone': 'Asia/Shanghai',
                'official_url': 'https://ctf.bugku.com/'
            },
            {
                'id': 4,
                'name': '企业安全众测',
                'startTime': '2024-11-01T08:00:00Z',
                'endTime': '2024-11-30T23:59:59Z',
                'timezone': 'Asia/Shanghai',
                'official_url': 'https://www.butian.net/'
            }
        ]
        
        # 为每个比赛计算状态
        for comp in competitions:
            start_time = datetime.fromisoformat(comp['startTime'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(comp['endTime'].replace('Z', '+00:00'))
            
            if server_time < start_time:
                comp['status'] = 0  # 未开始
                comp['time_until_start'] = int((start_time - server_time).total_seconds())
            elif start_time <= server_time <= end_time:
                comp['status'] = 1  # 进行中
                comp['time_until_end'] = int((end_time - server_time).total_seconds())
            else:
                comp['status'] = 2  # 已结束
                comp['ended_ago'] = int((server_time - end_time).total_seconds())
        
        return jsonify({
            'success': True,
            'server_time': server_time.isoformat(),
            'competitions': competitions,
            'last_updated': server_time.isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'server_time': datetime.now(timezone.utc).isoformat()
        }), 500