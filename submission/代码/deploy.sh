#!/bin/bash

# 网络安全实训平台部署脚本
# 支持开发环境和生产环境部署

set -e

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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 环境初始化
init_environment() {
    log_info "初始化环境..."
    
    # 创建必要的目录
    mkdir -p logs
    mkdir -p ssl
    mkdir -p data/prometheus
    mkdir -p data/grafana
    mkdir -p data/loki
    
    # 设置权限
    chmod 755 logs
    chmod 755 data
    
    log_success "环境初始化完成"
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    
    docker-compose build --no-cache
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    local env=${1:-"development"}
    
    log_info "启动服务 (环境: $env)..."
    
    if [ "$env" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "服务启动完成"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    docker-compose down
    
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    local env=${1:-"development"}
    
    log_info "重启服务..."
    
    stop_services
    start_services $env
    
    log_success "服务重启完成"
}

# 查看服务状态
check_status() {
    log_info "检查服务状态..."
    
    docker-compose ps
    
    echo ""
    log_info "健康检查..."
    
    # 检查主应用
    if curl -f http://localhost:5000/api/monitoring/health &> /dev/null; then
        log_success "主应用运行正常"
    else
        log_warning "主应用可能存在问题"
    fi
    
    # 检查监控服务
    if curl -f http://localhost:9090 &> /dev/null; then
        log_success "Prometheus运行正常"
    else
        log_warning "Prometheus可能存在问题"
    fi
    
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Grafana运行正常"
    else
        log_warning "Grafana可能存在问题"
    fi
}

# 查看日志
view_logs() {
    local service=${1:-"web"}
    
    log_info "查看 $service 服务日志..."
    
    docker-compose logs -f $service
}

# 备份数据
backup_data() {
    local backup_dir="backup/$(date +%Y%m%d_%H%M%S)"
    
    log_info "备份数据到 $backup_dir..."
    
    mkdir -p $backup_dir
    
    # 备份数据库
    docker-compose exec web python -c "from app import app, db; app.app_context().push(); db.create_all()" > /dev/null
    cp app.db $backup_dir/ 2>/dev/null || log_warning "数据库备份失败"
    
    # 备份配置文件
    cp docker-compose.yml $backup_dir/
    cp -r monitoring $backup_dir/
    
    # 备份日志
    cp -r logs $backup_dir/ 2>/dev/null || log_warning "日志备份失败"
    
    log_success "数据备份完成: $backup_dir"
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    
    # 停止并删除容器
    docker-compose down --volumes --remove-orphans
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的卷
    docker volume prune -f
    
    log_success "清理完成"
}

# 更新服务
update() {
    log_info "更新服务..."
    
    # 拉取最新代码
    git pull origin main
    
    # 重新构建并启动
    build_images
    restart_services
    
    log_success "更新完成"
}

# 显示帮助信息
show_help() {
    echo "网络安全实训平台部署脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  init                初始化环境"
    echo "  build               构建Docker镜像"
    echo "  start [env]         启动服务 (env: development|production)"
    echo "  stop                停止服务"
    echo "  restart [env]       重启服务"
    echo "  status              查看服务状态"
    echo "  logs [service]      查看服务日志"
    echo "  backup              备份数据"
    echo "  cleanup             清理Docker资源"
    echo "  update              更新服务"
    echo "  help                显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 init                    # 初始化环境"
    echo "  $0 start development       # 启动开发环境"
    echo "  $0 start production        # 启动生产环境"
    echo "  $0 logs web                # 查看web服务日志"
    echo "  $0 backup                  # 备份数据"
}

# 主函数
main() {
    case "$1" in
        "init")
            check_dependencies
            init_environment
            ;;
        "build")
            check_dependencies
            build_images
            ;;
        "start")
            check_dependencies
            start_services $2
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            check_dependencies
            restart_services $2
            ;;
        "status")
            check_status
            ;;
        "logs")
            view_logs $2
            ;;
        "backup")
            backup_data
            ;;
        "cleanup")
            cleanup
            ;;
        "update")
            check_dependencies
            update
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            log_error "请指定命令，使用 '$0 help' 查看帮助"
            exit 1
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"