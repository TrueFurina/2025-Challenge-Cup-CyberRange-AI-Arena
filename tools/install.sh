#!/bin/bash

# AI Agent驱动的动态攻防推演靶场平台 - 一键部署脚本
# Copyright (c) 2025 Manus AI Team

set -e

echo "=== AI Agent驱动的动态攻防推演靶场平台 - 一键部署 ==="
echo "版本：v1.0"
echo "开发团队：Manus AI"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查系统环境
check_system() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_success "操作系统：Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log_success "操作系统：macOS"
    else
        log_error "不支持的操作系统：$OSTYPE"
        exit 1
    fi
    
    # 检查Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        log_success "Python版本：$PYTHON_VERSION"
    else
        log_error "未找到Python3，请先安装Python 3.8+"
        exit 1
    fi
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js版本：$NODE_VERSION"
    else
        log_error "未找到Node.js，请先安装Node.js 16.0+"
        exit 1
    fi
    
    # 检查Docker（可选）
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker版本：$DOCKER_VERSION"
        DOCKER_AVAILABLE=true
    else
        log_warning "未找到Docker，将使用本地部署模式"
        DOCKER_AVAILABLE=false
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    # 后端依赖
    log_info "安装后端依赖..."
    cd programs/cyber_range_platform
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # 激活虚拟环境并安装依赖
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    cd ../..
    
    # 前端依赖
    log_info "安装前端依赖..."
    cd programs/cyber_range_frontend
    npm install
    cd ../..
    
    log_success "依赖安装完成"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."
    
    # 检查PostgreSQL
    if command -v psql &> /dev/null; then
        log_info "使用PostgreSQL数据库"
        # 这里可以添加PostgreSQL初始化逻辑
    else
        log_info "使用SQLite数据库"
    fi
    
    cd programs/cyber_range_platform
    source venv/bin/activate
    
    # 创建数据库表
    python -c "
from src.main import app
from src.models.user import db
with app.app_context():
    db.create_all()
    print('数据库表创建成功')
"
    
    cd ../..
    log_success "数据库初始化完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动后端服务
    log_info "启动后端服务..."
    cd programs/cyber_range_platform
    source venv/bin/activate
    nohup python src/main.py > ../../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../../backend.pid
    cd ../..
    
    # 等待后端启动
    sleep 5
    
    # 检查后端是否启动成功
    if curl -s http://localhost:5000/api/health > /dev/null; then
        log_success "后端服务启动成功 (PID: $BACKEND_PID)"
    else
        log_error "后端服务启动失败"
        exit 1
    fi
    
    # 启动前端服务
    log_info "启动前端服务..."
    cd programs/cyber_range_frontend
    nohup npm run dev > ../../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../../frontend.pid
    cd ../..
    
    # 等待前端启动
    sleep 10
    
    log_success "前端服务启动成功 (PID: $FRONTEND_PID)"
}

# Docker部署
deploy_with_docker() {
    log_info "使用Docker部署..."
    
    # 创建Docker Compose文件
    cat > docker-compose.yml << 'DOCKER_EOF'
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: cyber_range
      POSTGRES_USER: cyber_user
      POSTGRES_PASSWORD: cyber123456
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./programs/cyber_range_platform
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://cyber_user:cyber123456@postgres:5432/cyber_range
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./programs/cyber_range_frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
DOCKER_EOF

    # 启动Docker Compose
    docker-compose up -d
    
    log_success "Docker部署完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 检查后端API
    if curl -s http://localhost:5000/api/health > /dev/null; then
        log_success "后端API正常"
    else
        log_error "后端API异常"
    fi
    
    # 检查前端服务
    if curl -s http://localhost:5173 > /dev/null; then
        log_success "前端服务正常"
    else
        log_warning "前端服务可能还在启动中..."
    fi
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=== 部署完成 ==="
    echo ""
    log_success "平台已成功部署！"
    echo ""
    echo "访问地址："
    echo "  前端界面：http://localhost:5173"
    echo "  后端API：http://localhost:5000"
    echo ""
    echo "默认账户："
    echo "  用户名：admin"
    echo "  密码：admin123"
    echo ""
    echo "日志文件："
    echo "  后端日志：backend.log"
    echo "  前端日志：frontend.log"
    echo ""
    echo "停止服务："
    echo "  ./stop.sh"
    echo ""
    log_info "感谢使用AI Agent驱动的动态攻防推演靶场平台！"
}

# 创建停止脚本
create_stop_script() {
    cat > stop.sh << 'STOP_EOF'
#!/bin/bash

echo "停止AI Agent驱动的动态攻防推演靶场平台..."

# 停止后端服务
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "后端服务已停止 (PID: $BACKEND_PID)"
    fi
    rm backend.pid
fi

# 停止前端服务
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "前端服务已停止 (PID: $FRONTEND_PID)"
    fi
    rm frontend.pid
fi

# 停止Docker服务（如果存在）
if [ -f docker-compose.yml ]; then
    docker-compose down
    echo "Docker服务已停止"
fi

echo "所有服务已停止"
STOP_EOF

    chmod +x stop.sh
}

# 主函数
main() {
    echo "开始部署..."
    
    check_system
    
    # 选择部署模式
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo ""
        echo "请选择部署模式："
        echo "1) 本地部署（推荐用于开发）"
        echo "2) Docker部署（推荐用于生产）"
        echo ""
        read -p "请输入选择 (1-2): " DEPLOY_MODE
        
        case $DEPLOY_MODE in
            1)
                install_dependencies
                init_database
                start_services
                ;;
            2)
                deploy_with_docker
                ;;
            *)
                log_error "无效选择"
                exit 1
                ;;
        esac
    else
        install_dependencies
        init_database
        start_services
    fi
    
    verify_deployment
    create_stop_script
    show_access_info
}

# 执行主函数
main "$@"
