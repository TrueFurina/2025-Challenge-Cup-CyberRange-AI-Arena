@echo off
setlocal enabledelayedexpansion

REM 网络安全实训平台部署脚本 (Windows版本)
REM 支持开发环境和生产环境部署

set "SCRIPT_NAME=%~nx0"
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 日志函数
:log_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:log_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:log_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查依赖
:check_dependencies
call :log_info "检查系统依赖..."

docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker 未安装，请先安装 Docker Desktop"
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker Compose 未安装，请先安装 Docker Compose"
    exit /b 1
)

call :log_success "依赖检查完成"
goto :eof

REM 环境初始化
:init_environment
call :log_info "初始化环境..."

REM 创建必要的目录
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl
if not exist "data" mkdir data
if not exist "data\prometheus" mkdir data\prometheus
if not exist "data\grafana" mkdir data\grafana
if not exist "data\loki" mkdir data\loki
if not exist "backup" mkdir backup

call :log_success "环境初始化完成"
goto :eof

REM 构建镜像
:build_images
call :log_info "构建Docker镜像..."

docker-compose build --no-cache
if errorlevel 1 (
    call :log_error "镜像构建失败"
    exit /b 1
)

call :log_success "镜像构建完成"
goto :eof

REM 启动服务
:start_services
set "env=%~1"
if "%env%"=="" set "env=development"

call :log_info "启动服务 (环境: %env%)..."

if "%env%"=="production" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else (
    docker-compose up -d
)

if errorlevel 1 (
    call :log_error "服务启动失败"
    exit /b 1
)

call :log_success "服务启动完成"
call :show_urls
goto :eof

REM 停止服务
:stop_services
call :log_info "停止服务..."

docker-compose down
if errorlevel 1 (
    call :log_error "服务停止失败"
    exit /b 1
)

call :log_success "服务已停止"
goto :eof

REM 重启服务
:restart_services
set "env=%~1"
call :log_info "重启服务..."

call :stop_services
call :start_services %env%

call :log_success "服务重启完成"
goto :eof

REM 查看服务状态
:check_status
call :log_info "检查服务状态..."

docker-compose ps

echo.
call :log_info "健康检查..."

REM 检查主应用
curl -f http://localhost:5000/api/monitoring/health >nul 2>&1
if errorlevel 1 (
    call :log_warning "主应用可能存在问题"
) else (
    call :log_success "主应用运行正常"
)

REM 检查监控服务
curl -f http://localhost:9090 >nul 2>&1
if errorlevel 1 (
    call :log_warning "Prometheus可能存在问题"
) else (
    call :log_success "Prometheus运行正常"
)

curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    call :log_warning "Grafana可能存在问题"
) else (
    call :log_success "Grafana运行正常"
)

call :show_urls
goto :eof

REM 显示访问地址
:show_urls
echo.
echo ================================
echo 服务访问地址:
echo ================================
echo 主应用:        http://localhost:5000
echo 运维管理:      http://localhost:5000/operations-management.html
echo 管理员控制台:  http://localhost:5000/admin-dashboard.html
echo Prometheus:   http://localhost:9090
echo Grafana:      http://localhost:3000 (admin/admin123)
echo ================================
echo.
goto :eof

REM 查看日志
:view_logs
set "service=%~1"
if "%service%"=="" set "service=web"

call :log_info "查看 %service% 服务日志..."

docker-compose logs -f %service%
goto :eof

REM 备份数据
:backup_data
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set "mydate=%%c%%a%%b"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "mytime=%%a%%b"
set "backup_dir=backup\%mydate%_%mytime%"

call :log_info "备份数据到 %backup_dir%..."

if not exist "%backup_dir%" mkdir "%backup_dir%"

REM 备份数据库
if exist "app.db" copy "app.db" "%backup_dir%\" >nul

REM 备份配置文件
copy "docker-compose.yml" "%backup_dir%\" >nul
if exist "monitoring" xcopy "monitoring" "%backup_dir%\monitoring\" /E /I /Q >nul

REM 备份日志
if exist "logs" xcopy "logs" "%backup_dir%\logs\" /E /I /Q >nul

call :log_success "数据备份完成: %backup_dir%"
goto :eof

REM 清理资源
:cleanup
call :log_info "清理Docker资源..."

REM 停止并删除容器
docker-compose down --volumes --remove-orphans

REM 清理未使用的镜像
docker image prune -f

REM 清理未使用的卷
docker volume prune -f

call :log_success "清理完成"
goto :eof

REM 更新服务
:update
call :log_info "更新服务..."

REM 拉取最新代码 (如果使用Git)
git pull origin main >nul 2>&1

REM 重新构建并启动
call :build_images
call :restart_services

call :log_success "更新完成"
goto :eof

REM 显示帮助信息
:show_help
echo 网络安全实训平台部署脚本 (Windows版本)
echo.
echo 用法: %SCRIPT_NAME% [命令] [选项]
echo.
echo 命令:
echo   init                初始化环境
echo   build               构建Docker镜像
echo   start [env]         启动服务 (env: development^|production)
echo   stop                停止服务
echo   restart [env]       重启服务
echo   status              查看服务状态
echo   logs [service]      查看服务日志
echo   backup              备份数据
echo   cleanup             清理Docker资源
echo   update              更新服务
echo   help                显示帮助信息
echo.
echo 示例:
echo   %SCRIPT_NAME% init                    # 初始化环境
echo   %SCRIPT_NAME% start development       # 启动开发环境
echo   %SCRIPT_NAME% start production        # 启动生产环境
echo   %SCRIPT_NAME% logs web                # 查看web服务日志
echo   %SCRIPT_NAME% backup                  # 备份数据
echo.
goto :eof

REM 主函数
:main
if "%~1"=="" (
    call :log_error "请指定命令，使用 '%SCRIPT_NAME% help' 查看帮助"
    exit /b 1
)

if "%~1"=="init" (
    call :check_dependencies
    call :init_environment
) else if "%~1"=="build" (
    call :check_dependencies
    call :build_images
) else if "%~1"=="start" (
    call :check_dependencies
    call :start_services %~2
) else if "%~1"=="stop" (
    call :stop_services
) else if "%~1"=="restart" (
    call :check_dependencies
    call :restart_services %~2
) else if "%~1"=="status" (
    call :check_status
) else if "%~1"=="logs" (
    call :view_logs %~2
) else if "%~1"=="backup" (
    call :backup_data
) else if "%~1"=="cleanup" (
    call :cleanup
) else if "%~1"=="update" (
    call :check_dependencies
    call :update
) else if "%~1"=="help" (
    call :show_help
) else if "%~1"=="--help" (
    call :show_help
) else if "%~1"=="-h" (
    call :show_help
) else (
    call :log_error "未知命令: %~1"
    call :show_help
    exit /b 1
)

goto :eof

REM 执行主函数
call :main %*