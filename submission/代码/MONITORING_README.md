# 监控与运维系统

本文档介绍网络安全实训平台的监控与运维功能，包括性能监控、健康检查和自动化部署。

## 🚀 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- Python 3.9+ (开发环境)
- 4GB+ RAM
- 10GB+ 磁盘空间

### 快速部署

#### Windows 环境
```bash
# 初始化环境
.\deploy.bat init

# 启动开发环境
.\deploy.bat start development

# 查看服务状态
.\deploy.bat status
```

#### Linux/macOS 环境
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 初始化环境
./deploy.sh init

# 启动开发环境
./deploy.sh start development

# 查看服务状态
./deploy.sh status
```

## 📊 监控功能

### 1. 系统性能监控

#### 实时指标收集
- **CPU使用率**: 实时监控系统CPU负载
- **内存使用率**: 监控内存占用情况
- **磁盘使用率**: 监控磁盘空间使用
- **网络流量**: 监控网络I/O状态
- **进程信息**: 监控关键进程状态

#### 访问方式
- **运维管理页面**: http://localhost:5000/operations-management.html
- **API接口**: http://localhost:5000/api/monitoring/system

### 2. 应用监控

#### Prometheus指标
- **请求计数**: 统计API请求次数
- **响应时间**: 监控接口响应延迟
- **错误率**: 统计错误请求比例
- **数据库连接**: 监控数据库连接状态

#### 访问方式
- **Prometheus**: http://localhost:9090
- **指标端点**: http://localhost:5000/api/monitoring/metrics

### 3. 可视化监控

#### Grafana仪表板
- **系统概览**: 系统整体运行状态
- **应用性能**: Flask应用性能指标
- **资源使用**: CPU、内存、磁盘使用趋势
- **告警信息**: 实时告警和通知

#### 访问方式
- **Grafana**: http://localhost:3000
- **默认账号**: admin / admin123

## 🔍 健康检查

### 1. 服务健康状态

#### 检查项目
- **Web服务器**: Flask应用运行状态
- **数据库连接**: SQLite数据库连接状态
- **磁盘空间**: 磁盘剩余空间检查
- **内存使用**: 内存使用率检查
- **关键进程**: 重要进程运行状态

#### API接口
```bash
# 获取健康检查状态
curl http://localhost:5000/api/monitoring/health

# 响应示例
{
  "status": "healthy",
  "checks": {
    "web_server": "healthy",
    "database": "healthy",
    "disk_space": "healthy",
    "memory_usage": "healthy"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. 自动健康检查

#### Docker健康检查
- 每30秒自动检查服务状态
- 连续3次失败后标记为不健康
- 自动重启不健康的容器

#### 监控告警
- CPU使用率 > 80% 告警
- 内存使用率 > 85% 告警
- 磁盘使用率 > 90% 告警
- 服务响应时间 > 5秒 告警

## 🚀 自动化部署

### 1. 容器化部署

#### Docker镜像
- **基础镜像**: Python 3.9-slim
- **多阶段构建**: 优化镜像大小
- **安全配置**: 非root用户运行
- **健康检查**: 内置健康检查机制

#### 服务编排
```yaml
# 主要服务
- web: Flask应用
- redis: 缓存服务
- nginx: 反向代理
- prometheus: 指标收集
- grafana: 监控可视化
- loki: 日志收集
```

### 2. CI/CD流水线

#### GitHub Actions
- **代码质量检查**: Flake8, Black, isort
- **安全扫描**: Trivy漏洞扫描
- **自动化测试**: pytest单元测试
- **镜像构建**: 多架构Docker镜像
- **自动部署**: 测试和生产环境

#### 部署流程
```
代码提交 → 质量检查 → 安全扫描 → 构建镜像 → 部署测试环境 → 集成测试 → 部署生产环境
```

### 3. 部署脚本

#### 功能特性
- **环境初始化**: 自动创建必要目录和配置
- **依赖检查**: 检查Docker和Docker Compose
- **服务管理**: 启动、停止、重启服务
- **状态监控**: 实时查看服务运行状态
- **数据备份**: 自动备份数据库和配置
- **资源清理**: 清理无用的Docker资源

## 🛠️ 运维管理

### 1. 系统维护

#### 维护任务
- **服务重启**: 重启所有服务或指定服务
- **数据库备份**: 自动备份SQLite数据库
- **日志清理**: 清理过期的日志文件
- **缓存清理**: 清理Redis缓存数据
- **临时文件清理**: 清理系统临时文件

#### API接口
```bash
# 执行维护任务
curl -X POST http://localhost:5000/api/monitoring/maintenance \
  -H "Content-Type: application/json" \
  -d '{"task": "restart_services"}'
```

### 2. 日志管理

#### 日志收集
- **应用日志**: Flask应用运行日志
- **访问日志**: HTTP请求访问日志
- **错误日志**: 系统和应用错误日志
- **系统日志**: 系统级别的操作日志

#### 日志查看
```bash
# 查看应用日志
./deploy.bat logs web

# 查看所有服务日志
./deploy.bat logs

# 实时查看日志
docker-compose logs -f
```

### 3. 性能优化

#### 缓存策略
- **Redis缓存**: 缓存频繁查询的数据
- **静态文件缓存**: Nginx静态文件缓存
- **数据库查询优化**: 索引和查询优化

#### 负载均衡
- **Nginx反向代理**: 请求分发和负载均衡
- **健康检查**: 自动剔除不健康的后端
- **限流保护**: API请求频率限制

## 📈 监控指标

### 1. 系统指标

| 指标名称 | 描述 | 阈值 |
|---------|------|------|
| CPU使用率 | 系统CPU占用百分比 | >80%告警 |
| 内存使用率 | 系统内存占用百分比 | >85%告警 |
| 磁盘使用率 | 磁盘空间占用百分比 | >90%告警 |
| 网络I/O | 网络输入输出速率 | - |
| 系统负载 | 系统平均负载 | >2.0告警 |

### 2. 应用指标

| 指标名称 | 描述 | 阈值 |
|---------|------|------|
| 请求总数 | API请求总计数 | - |
| 响应时间 | 平均响应时间 | >5s告警 |
| 错误率 | 错误请求比例 | >5%告警 |
| 并发用户 | 同时在线用户数 | - |
| 数据库连接 | 数据库连接池状态 | - |

### 3. 业务指标

| 指标名称 | 描述 | 说明 |
|---------|------|------|
| 用户注册数 | 新用户注册统计 | 日/周/月统计 |
| 活跃用户数 | 活跃用户统计 | 日活/月活 |
| 实验完成率 | 实验任务完成比例 | 按实验类型统计 |
| 系统使用率 | 平台功能使用情况 | 各模块使用统计 |

## 🚨 告警配置

### 1. 告警规则

#### 系统告警
- CPU使用率持续5分钟超过80%
- 内存使用率持续3分钟超过85%
- 磁盘使用率超过90%
- 服务不可用超过1分钟

#### 应用告警
- API响应时间超过5秒
- 错误率超过5%
- 数据库连接失败
- 关键服务进程停止

### 2. 通知方式

#### 支持的通知渠道
- **邮件通知**: SMTP邮件发送
- **Slack通知**: Slack频道消息
- **钉钉通知**: 钉钉群机器人
- **短信通知**: 短信告警(需配置)

## 🔧 故障排查

### 1. 常见问题

#### 服务启动失败
```bash
# 检查Docker服务状态
docker info

# 检查端口占用
netstat -tulpn | grep :5000

# 查看容器日志
docker-compose logs web
```

#### 监控数据异常
```bash
# 检查Prometheus配置
curl http://localhost:9090/api/v1/targets

# 检查指标端点
curl http://localhost:5000/api/monitoring/metrics

# 重启监控服务
docker-compose restart prometheus grafana
```

#### 性能问题
```bash
# 检查系统资源
top
df -h
free -m

# 检查容器资源使用
docker stats

# 分析日志
tail -f logs/app.log
```

### 2. 性能调优

#### 系统优化
- 增加系统内存
- 使用SSD存储
- 优化网络配置
- 调整内核参数

#### 应用优化
- 数据库索引优化
- 缓存策略调整
- 代码性能优化
- 资源池配置

## 📚 参考资料

### 1. 相关文档
- [Docker官方文档](https://docs.docker.com/)
- [Prometheus文档](https://prometheus.io/docs/)
- [Grafana文档](https://grafana.com/docs/)
- [Flask文档](https://flask.palletsprojects.com/)

### 2. 最佳实践
- [容器化最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [监控系统设计](https://prometheus.io/docs/practices/)
- [CI/CD流水线](https://docs.github.com/en/actions)
- [安全配置指南](https://cheatsheetseries.owasp.org/)

---

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 查看本文档的故障排查部分
2. 检查系统日志和错误信息
3. 提交Issue到项目仓库
4. 联系技术支持团队

**注意**: 在生产环境中使用前，请务必进行充分的测试和安全配置。