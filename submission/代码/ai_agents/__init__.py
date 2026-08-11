"""AI Agent 攻防推演模块（2025 项目 AI 集成）。

从 backup/root-py-drafts 草稿重构而来，集成进正式交付版：
- attack_agent：攻击 Agent（自主规划攻击路径）
- defense_agent：防御 Agent（检测/响应决策）
- orchestrator：attack vs defense 回合制对抗编排
- client：LLM 统一客户端（fail-open，无 Key 规则兜底）

设计原则（对齐 2026 Security-Agent 经验）：
1. fail-open：LLM 不可用时规则兜底，绝不崩溃
2. 多 provider：DeepSeek 主用 / Qwen / OpenAI 兼容
3. 防御性解析：LLM 输出字段校验，非法回退默认
"""
