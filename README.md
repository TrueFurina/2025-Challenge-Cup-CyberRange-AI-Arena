# AI Agent-Driven Dynamic Attack-Defense Cyber Range Platform

> **中文版说明**：[README.zh.md](README.zh.md)

An AI-Agent-powered cyber range platform for dynamic attack-defense drills, built for the 19th "Challenge Cup" 2025 Hackathon & Decree Board (SH24, proposed by DBAPPSecurity/安恒信息). The platform replaces manual red/blue teams with AI Agents to deliver **dynamic scenario generation, intelligent attack simulation, adaptive defense decisions, and automated drill evaluation**.

## ✨ Features

### 1. Dynamic Scenario Generation
- Auto-build network topologies from business models (enterprise/government/education)
- Plant known vulnerabilities (12 CVE entries with severity) by difficulty
- Adjustable environment parameters: target count / vulnerability density / defense strength

### 2. Intelligent Attack Simulation
- 12-technique attack library (SQLi / XSS / command injection / brute force / WebShell / SSRF / CSRF / ...)
- AI Attack Agent plans multi-step attack chains from the vulnerability library (LLM decision + rule fallback)
- Real test: plans "SQL injection → SSH weak-password brute force → WebShell persistence" chain

### 3. Adaptive Defense Decision
- 12-strategy defense library (WAF / IDS / isolation / patching / account lockout / ...)
- AI Defense Agent gives graded responses by threat level (low/medium/high/critical)
- Round-based attack-defense arena (up to 5 rounds) with live decision-stream visualization

### 4. Automated Drill Evaluation
- Quantified metrics: attack success rate, defense response actions, threat distribution
- Auto-generated evaluation report after the arena (exportable JSON)
- Full process logging for review and audit

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Jinja2 templates + vanilla JS (31 pages) |
| Backend | Flask 3.1.3 + Flask-SQLAlchemy + SQLite |
| AI Agents | DeepSeek / OpenAI-compatible LLM (fail-open, rule fallback) |
| Monitoring | Prometheus + Grafana + Loki |
| Deployment | Docker Compose + nginx + CI/CD |

## 🚀 Quick Start

```bash
cd submission/代码

# Install dependencies
pip install flask flask-sqlalchemy flask-migrate flask-cors psutil requests

# Seed database (idempotent: 12 attacks / 12 defenses / 12 vulnerabilities / 8 tools)
python seed.py

# Start server (default port 5000)
python app.py
```

Then open:
- **Home**: `http://127.0.0.1:5000/`
- **AI Arena** (attack-defense + scenario topology): `http://127.0.0.1:5000/ai-arena`
- **Agent Monitor** (decision stream + evaluation): `http://127.0.0.1:5000/ai-agent-monitor`

> Default accounts (for demo only — **change immediately in production**): `admin / admin123`, `student / 123456`

## 🔌 AI API Reference (prefix `/api/ai`)

| Method & Path | Description |
|---------------|-------------|
| `POST /api/ai/session` | Create arena session (params: `target_count`, `vuln_density`, `defense_strength`) |
| `POST /api/ai/session/<id>/round` | Run one round of attack-defense |
| `POST /api/ai/session/<id>/run` | Run all rounds at once |
| `GET /api/ai/session/<id>` | Query arena status (decision stream) |
| `GET /api/ai/session/<id>/evaluate` | Get quantified evaluation report |
| `POST /api/ai/scenario/generate` | Generate dynamic scenario topology |

## 🛡️ Security Notes

- **Token auth** (P0 fix): login issues a token; sensitive APIs require `Authorization: Bearer <token>`
- **CORS whitelist** + `same-origin` CORP (fixed from `*`/`cross-origin`)
- **Debug mode off** (Werkzeug debugger RCE surface closed)
- 11 security vulnerabilities discovered & fixed via dynamic testing (14/14 regression passed)

## 📁 Repository Layout

```
submission/代码/          # Flask application
  ├── app.py              # Entry point
  ├── backend/            # Routes / models / monitoring / AI API
  ├── ai_agents/          # Attack / Defense agents + arena orchestrator
  ├── templates/          # 31 HTML pages (incl. ai-arena, ai-agent-monitor)
  └── static/             # JS / CSS / components
documents/                # 7 technical documents (requirements, architecture, dev, deploy, test...)
presentation/             # HTML slide deck
```

## 📄 Documents

- [PRD (Product Requirements)](submission/PRD-需求文档.md)
- [White Paper (Chinese)](submission/白皮书-产品介绍.md)
- Technical docs in `documents/` (requirements analysis, architecture design, development guide, test report, deployment manual, user manual)

## 🤝 License

[MIT](LICENSE) © Minjiang University Team

---

**Built for the 19th "Challenge Cup" 2025 Hackathon & Decree Board — DBAPPSecurity (安恒信息) proposal SH24.**
