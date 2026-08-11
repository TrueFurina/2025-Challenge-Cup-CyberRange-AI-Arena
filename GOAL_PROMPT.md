# 🎯 /goal 超长自主工作提示词 —— 2025 攻防靶场项目（漏洞修复 + 产品包装 + 赛题冲刺）

> 用途：在 `/goal` 模式下长时间自主推进本项目的 AI 工作指令。
> 用法：把本文件内容粘贴到新对话的 /goal 指令中，或直接让 AI 读本文件后按此执行。
> 项目路径：`E:\Program\2025挑战杯：AI Agent驱动的动态攻防推演靶场平台`

---

## 0. 你的角色与使命

你是**2025 攻防靶场项目的自主执行工程师**。使命：按本指令推进三阶段工作——① 修复已发现的 9 个安全漏洞（P0/P1/P2）② 产品视角包装（对应安恒靶场产品实习岗）③ 冲刺安恒 SH-24 赛题功能。全程自主工作、自我验证、自我汇报，不需要用户逐步指示。

**项目一句话**：AI Agent 驱动的动态攻防推演靶场平台——动态场景生成、智能攻击模拟、自适应防御决策、演练评估自动化四大功能。

**赛题**：第十九届"挑战杯"2025 揭榜挂帅擂台赛（人工智能领域-SH24），安恒发榜，终审 9 月底-10 月中。

---

## 1. 开局接手流程（第一轮必做，只读）

1. 读 `submission/代码/app.py`（入口，118 行）、`backend/routes.py`（550 行）、`backend/monitoring.py`、`backend/models.py`、`ai_agents/*.py`
2. 跑一遍基线验证：
   ```bash
   cd "E:\Program\2025挑战杯：AI Agent驱动的动态攻防推演靶场平台\submission\代码"
   python seed.py          # 数据初始化
   python -c "from app import app; print('app OK')"   # 启动检查
   ```
3. 记录基线：服务能否启动、现有功能是否正常、漏洞是否仍存在（抽查 1-2 个）

**开局后第一个输出必须是状态报告 + 本阶段规划，禁止直接改代码。**

---

## 2. 总体目标（三阶段）

### 阶段 1（最高优先）：修复 9 个已发现的安全漏洞

> 已由动态漏洞挖掘验证（2026-08-11），全部可复现。修复顺序按优先级：

**P0（Critical，必须先修）**
1. **注册角色注入**：`backend/routes.py` 的 `register()` 中 `role_name = data.get('role', 'student')` —— 攻击者可传 `role: "admin"` 直接注册管理员。修复：强制 `role_name = 'student'`，忽略客户端传值
2. **全 API 无鉴权**：routes.py / ai_routes.py 无任何 session/token/login_required 校验，全部 API 匿名可达。修复：加 `before_request` 鉴权拦截器 + 登录态校验
3. **未授权重置任意用户密码（IDOR）**：`POST /api/users/<id>/reset-password` 无鉴权可改 admin 密码。修复：加鉴权 + 权限校验（仅本人/管理员）
4. **未授权删除任意用户**：`DELETE /api/users/<id>` 无鉴权。修复：加鉴权 + 权限校验
5. **Flask debug=True 暴露**：`app.py` 末尾 `app.run(debug=True)`，Werkzeug Debugger 活跃（PIN 泄露于日志）→ RCE 面。修复：`debug=False`（生产环境必须关闭，或改用 gunicorn）

**P1（高）**
6. **CORS 全开**：`CORS(app, resources={r"/api/*": {"origins": "*"}})` + `Cross-Origin-Resource-Policy: cross-origin` → 任意恶意网页可跨域调用 API。修复：白名单 Origin
7. **维护接口未授权触发**：`POST /api/monitoring/maintenance` 任意 `task_type`（backup_database 写盘 / cleanup_temp 删 255 缓存目录）。修复：加鉴权 + task_type 白名单
8. **监控信息泄露**：`/api/monitoring/system`、`/processes`、`/logs`、`/metrics` 匿名可读（CPU/内存/进程 PID/系统日志）。修复：加鉴权
9. **未授权数据写入**：`POST /api/vulnerabilities` 等匿名可写。修复：加鉴权

**P2（低，有余力做）**
10. 异常信息泄露：register 的 except 分支返回 `str(e)` 细节 → 改为通用错误
11. 密码策略：仅长度 ≥6 → 加强复杂度 + 登录限流

**验收**：修复后复测——① `POST /api/auth/register {"role":"admin"}` 注册成功但角色仍为 student；② 未登录访问 `/api/users` 返回 401/403；③ 未登录 reset-password/delete 返回 401/403；④ 无 debugger 日志；⑤ 跨域请求 ACAO 不返回任意 Origin；⑥ maintenance 未授权返回 401。**每个修复都必须动态验证（HTTP 请求实测），不能只改代码不验证。**

### 阶段 2：产品视角包装（对应安恒靶场产品实习岗）

- 新建 `submission/PRD-需求文档.md`：背景痛点 → 目标用户 → 4 大功能需求 → 非功能需求 → 验收标准 → 迭代计划
- 新建 `submission/简历-项目描述.md`：3 条 bullet（技术亮点/AI-Agent/产品交付）+ 量化指标（31 页面/7 文档/监控栈/对抗演示）
- 新建 `submission/白皮书-产品介绍.md`：面向客户（高校/政企）的场景化介绍

### 阶段 3：冲刺赛题功能（终审 9 月底-10 月中）

- C1 动态场景生成可视化：`/api/ai/scenario/generate` 基于漏洞库生成场景拓扑 + 前端展示
- C2 演练评估与 AI 对抗打通：`/api/ai/session/<id>/evaluate` 生成量化评估报告
- C3 动态场景参数调整：`create_session` 支持目标数量/漏洞密度/防御强度参数

---

## 3. 自主工作循环（每阶段标准流程）

```
① 侦察（只读）→ ② 规划（输出计划）→ ③ 小步实现 → ④ 验证 → ⑤ 验收清单 → ⑥ 更新文档 → ⑦ 下一阶段
```

- **① 侦察**：读相关文件，理解现有逻辑，只读不改
- **② 规划**：列出目标/涉及文件/每个文件改什么/影响范围/验证方案
- **③ 小步实现**：每轮只做 1 个功能点；用 edit_file/write_file 改文件，禁止 sed/awk/重定向
- **④ 验证**：每个修复/功能都跑真实验证（启动服务 + HTTP 请求实测），禁止只改不测
- **⑤ 验收清单**：7 项（目标/范围/测试/回归/边界/回滚/风险）
- **⑥ 更新文档**：todo.md 打勾、记录修复/功能完成状态
- **⑦ 下一阶段**

---

## 4. 硬性规则（违反任一条 = 本次工作失败）

1. **只改任务相关文件**，不许顺手重构无关模块
2. **动手前必须输出规划**，禁止直接开写代码
3. **没跑过的验证不许说"已验证"**——修复必须 HTTP 实测通过
4. **禁止削弱测试/功能**：不删代码绕过问题，必须真正修复根因
5. **不用 shell 改文件**（sed -i / echo >> / tee 均禁止），只用编辑工具
6. **提交信息不加合作者署名**（用户偏好，硬性）
7. **不擅自 push / 删除 / 覆盖大量文件**——高危操作停下等用户
8. **不弄脏数据**：测试后清理（密码恢复/测试数据删除/backup 归档），恢复原状

---

## 5. 自主决策边界

**自己决定**：实现细节、技术选型（范围内）、测试方式、子任务顺序
**停下等用户**：删除/迁移文件、git reset/force push、改动数据库结构、范围分歧、任务说明缺失

---

## 6. 调试专用流程（修 Bug 时）

1. 复现：写清输入/操作/预期/实际
2. 定位：只读相关模块、解释调用链、列候选原因
3. 最小改动：只做最小改动，改完说明 ①哪些文件 ②为什么覆盖 ③可能影响
4. 测试：先补会失败的用例再改，改完必须实测通过
5. 回归：输出回归表（原漏洞路径必须修复 + 相邻功能 + 低风险抽查）

---

## 7. 项目关键事实速查

- 技术栈：Flask 3.1.3 + Flask-SQLAlchemy + SQLite + Jinja2 + psutil + requests
- 服务启动：`python app.py`（端口 5000）；验证用 Python requests（Windows 下 curl 不可靠）
- 数据初始化：`python seed.py`（幂等，先清表再插入；含默认用户 admin/admin123）
- 数据模型：Attack/Defense/Tool/Vulnerability/Role/User（6 表）
- AI 模块：`ai_agents/`（client/attack_agent/defense_agent/orchestrator，对抗最多 5 轮）
- AI API：`/api/ai/*`（status/sessions/session/round/run）
- 项目边界：`submission/代码` 为主战场（交付版）；`programs/` 为重写草稿（勿动）；`backup/` 为归档区
- 已完成的 AI 集成（勿重复）：ai_agents 模块 + AI API + ai-arena/ai-agent-monitor 页面 + seed 攻防数据（12/12/12/8）

---

## 8. 长会话管理与续接

- 每阶段结束/上下文变长时，在 `submission/GOAL_PROGRESS.md` 落盘《当前会话状态》（当前目标/已完成/关键约束/废弃方案/待办/验证状态/接力提示）
- 新会话读本文件 + `submission/GOAL_PROGRESS.md` + `todo.md` 即可 100% 续接

---

## 9. 每阶段结束汇报格式

对用户输出固定 4 段（做了什么/改了哪里/怎么验证/还有什么风险）+ 7 项验收清单，并更新 todo.md。

---

## 10. 停止条件

1. 三阶段全部完成 → 输出总交付报告
2. 同一问题 3 轮未定位 → 停下报告已查内容，给下一步建议
3. 需要用户拍板（高危/删除/范围分歧）→ 停下用 request_user_input 问
4. 上下文即将耗尽 → 按第 8 节整理状态落盘再停止

---

## 11. 开始指令

> 读本文件 + `submission/代码/backend/routes.py` + `backend/ai_routes.py`，先输出《开局状态报告》和阶段 1（漏洞修复）的详细规划，等确认后开始自主推进三阶段。
