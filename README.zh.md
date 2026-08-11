# AI Agent 驱动的动态攻防推演靶场平台

> **English version**: [README.md](README.md)

基于 AI Agent 的动态攻防推演靶场平台，是第十九届"挑战杯"2025 揭榜挂帅擂台赛（人工智能领域-SH24，安恒信息发榜）参赛作品。平台用 AI Agent 替代人工红蓝队，实现**动态场景生成、智能攻击模拟、自适应防御决策、演练评估自动化**四大核心功能。

## ✨ 核心功能

### 1. 动态场景生成
- 基于业务模型自动构建网络拓扑（企业/政务/教育多行业模板）
- 按难度植入已知漏洞（12 条 CVE，含严重度分级）
- 环境参数动态调整：目标数量 / 漏洞密度 / 防御强度

### 2. 智能攻击模拟
- 12 种攻击技术库（SQLi / XSS / 命令注入 / 爆破 / WebShell / SSRF / CSRF 等）
- AI 攻击 Agent 基于漏洞库自主规划攻击链（LLM 决策 + 规则兜底）
- 实测可规划"SQL 注入→SSH 弱口令→WebShell 持久控制"完整攻击链

### 3. 自适应防御决策
- 12 种防御策略库（WAF / IDS / 隔离 / 补丁 / 账号锁定等）
- AI 防御 Agent 按威胁等级（低/中/高/严重）分级响应
- 攻防回合制对抗（最多 5 轮），决策流实时可视化

### 4. 演练评估自动化
- 多维度量化指标：攻击成功率 / 防御响应 / 威胁分布
- 对抗结束自动生成评估报告（可导出 JSON）
- 全流程记录，支持复盘与审计

## 🏗️ 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Jinja2 模板 + 原生 JS（31 个页面） |
| 后端 | Flask 3.1.3 + Flask-SQLAlchemy + SQLite |
| AI Agent | DeepSeek / OpenAI 兼容 LLM（fail-open，规则兜底） |
| 监控 | Prometheus + Grafana + Loki |
| 部署 | Docker Compose + nginx + CI/CD |

## 🚀 快速开始

```bash
cd submission/代码

# 安装依赖
pip install flask flask-sqlalchemy flask-migrate flask-cors psutil requests

# 初始化数据（幂等：12 攻击 / 12 防御 / 12 漏洞 / 8 工具）
python seed.py

# 启动服务（默认端口 5000）
python app.py
```

访问：
- **首页**：`http://127.0.0.1:5000/`
- **攻防对抗大屏**（对抗 + 场景拓扑）：`http://127.0.0.1:5000/ai-arena`
- **Agent 决策监控**（决策流 + 演练评估）：`http://127.0.0.1:5000/ai-agent-monitor`

> 默认账户（仅演示用，**生产环境请立即修改**）：`admin / admin123`、`student / 123456`

## 🔌 AI 接口（前缀 /api/ai）

| 方法/路径 | 说明 |
|-----------|------|
| `POST /api/ai/session` | 创建对抗会话（参数：target_count / vuln_density / defense_strength） |
| `POST /api/ai/session/<id>/round` | 执行一轮攻防对抗 |
| `POST /api/ai/session/<id>/run` | 一键执行全部回合 |
| `GET /api/ai/session/<id>` | 查询对抗状态（决策流） |
| `GET /api/ai/session/<id>/evaluate` | 获取量化评估报告 |
| `POST /api/ai/scenario/generate` | 动态场景生成 |

## 🛡️ 安全说明

- **token 鉴权**（P0 修复）：登录签发 token，敏感接口需 `Authorization: Bearer <token>`
- **CORS 白名单** + `same-origin` CORP（原 `*` / `cross-origin` 已修复）
- **关闭 debug 模式**（堵 Werkzeug Debugger RCE 面）
- 动态漏洞挖掘发现并修复 11 项安全问题（修复后回归 14/14 通过）

## 📁 仓库结构

```
submission/代码/          # Flask 应用
  ├── app.py              # 入口
  ├── backend/            # 路由 / 模型 / 监控 / AI API
  ├── ai_agents/          # 攻击/防御 Agent + 对抗编排器
  ├── templates/          # 31 个 HTML 页面（含 ai-arena、ai-agent-monitor）
  └── static/             # JS / CSS / 组件
documents/                # 7 篇技术文档（需求/架构/开发/部署/测试/用户...）
presentation/             # HTML 幻灯片
```

## 📄 文档

- [产品需求文档 PRD](submission/PRD-需求文档.md)
- [产品白皮书](submission/白皮书-产品介绍.md)
- 技术文档见 `documents/`（需求分析、系统架构、开发文档、测试报告、部署手册、用户手册）

## 🤝 开源协议

[MIT](LICENSE) © 闽江学院团队

---

**第十九届"挑战杯"2025 揭榜挂帅擂台赛参赛作品（安恒信息 SH24 命题）**
