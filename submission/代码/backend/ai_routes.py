"""AI 攻防对抗 API 路由。

提供攻防推演的 AI Agent 能力：
- POST /api/ai/session      创建攻防对抗会话
- POST /api/ai/session/<id>/round  执行一轮对抗
- POST /api/ai/session/<id>/run    一键执行全部回合
- GET  /api/ai/session/<id>        查询对抗状态（决策流）
- GET  /api/ai/sessions            会话列表
- GET  /api/ai/status              系统 AI 能力状态
"""
from flask import Blueprint, jsonify, request

from backend.models import Attack, Defense, Vulnerability
from ai_agents.orchestrator import arena

ai_bp = Blueprint("ai", __name__)


# 阶段 3 C1：动态场景生成（赛题功能①）
def _generate_scenario(vulnerability_library, target_count=3, vuln_density=2):
    """基于漏洞库自动生成场景拓扑（主机/服务/漏洞分布）。"""
    hosts = []
    service_pool = ["http/80", "ssh/22", "mysql/3306", "smb/445", "rdp/3389", "ftp/21"]
    os_pool = ["linux", "windows", "centos", "ubuntu"]
    role_pool = ["Web 服务器", "数据库服务器", "文件服务器", "域控", "终端"]
    for i in range(max(1, min(target_count, 8))):
        vulns = vulnerability_library[i * vuln_density : i * vuln_density + vuln_density]
        hosts.append(
            {
                "id": f"host-{i+1}",
                "name": f"{role_pool[i % len(role_pool)]}-{i+1:02d}",
                "os": os_pool[i % len(os_pool)],
                "ip": f"10.10.{i + 1}.{i + 1}",
                "services": service_pool[i : i + 2],
                "vulnerabilities": [v.get("cve_id", v.get("name", "")) for v in vulns],
                "severity": max((v.get("severity", "low") for v in vulns), default="low"),
            }
        )
    return {
        "scenario_id": f"scn-{len(hosts)}h-{len(vulnerability_library)}v",
        "hosts": hosts,
        "total_hosts": len(hosts),
        "total_vulnerabilities": len(vulnerability_library),
    }


@ai_bp.route("/scenario/generate", methods=["POST"])
def generate_scenario():
    """动态场景生成：基于漏洞库自动构建网络拓扑。"""
    data = request.get_json(silent=True) or {}
    target_count = int(data.get("target_count", 3))
    vuln_density = int(data.get("vuln_density", 2))
    vulnerability_library = [v.to_dict() for v in Vulnerability.query.all()]
    if not vulnerability_library:
        return jsonify({"error": "漏洞库为空，请先 seed 数据"}), 400
    return jsonify(_generate_scenario(vulnerability_library, target_count, vuln_density))


def _default_target() -> dict:
    """默认目标资产（后续可扩展为动态资产）。"""
    return {"name": "web-app-01", "os": "linux", "services": ["http/80", "ssh/22", "mysql/3306"]}


@ai_bp.route("/status", methods=["GET"])
def status():
    """AI 能力状态（是否配置 API Key）。"""
    import os

    has_key = bool(os.environ.get("DEEPSEEK_API_KEY") or os.environ.get("LLM_API_KEY"))
    return jsonify(
        {
            "ai_enabled": has_key,
            "arena_sessions": len(arena.sessions),
            "max_rounds": arena.MAX_ROUNDS,
        }
    )


@ai_bp.route("/sessions", methods=["GET"])
def list_sessions():
    return jsonify({"sessions": arena.list_sessions()})


@ai_bp.route("/session", methods=["POST"])
def create_session():
    """创建攻防对抗会话（读取攻击库/漏洞库/防御库作为 Agent 知识）。

    阶段 3 C3：支持动态环境参数（target_count / vuln_density / defense_strength）。
    """
    data = request.get_json(silent=True) or {}
    target = data.get("target") or _default_target()
    params = data.get("params") or {}
    attack_library = [a.to_dict() for a in Attack.query.all()]
    vulnerability_library = [v.to_dict() for v in Vulnerability.query.all()]
    defense_library = [d.to_dict() for d in Defense.query.all()]
    session = arena.create_session(
        target_info=target,
        attack_library=attack_library,
        vulnerability_library=vulnerability_library,
        defense_library=defense_library,
        params=params,
    )
    return jsonify(
        {
            "session_id": session["id"],
            "status": session["status"],
            "target": session["target"],
            "params": session.get("params", {}),
            "knowledge_counts": {
                "attacks": len(attack_library),
                "vulnerabilities": len(vulnerability_library),
                "defenses": len(defense_library),
            },
        }
    ), 201


@ai_bp.route("/session/<session_id>/round", methods=["POST"])
def run_round(session_id):
    """执行一轮攻防对抗。"""
    result = arena.run_round(session_id)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result)


@ai_bp.route("/session/<session_id>/run", methods=["POST"])
def run_all(session_id):
    """一键执行全部回合。"""
    result = arena.run_all(session_id)
    if "error" in result:
        return jsonify(result), 404
    return jsonify(result)


@ai_bp.route("/session/<session_id>", methods=["GET"])
def get_session(session_id):
    """查询对抗状态（决策流供前端轮询）。"""
    session = arena.get_session(session_id)
    if session is None:
        return jsonify({"error": f"会话不存在: {session_id}"}), 404
    return jsonify(
        {
            "session_id": session["id"],
            "status": session["status"],
            "current_round": session["current_round"],
            "max_rounds": arena.MAX_ROUNDS,
            "rounds": session["rounds"],
        }
    )


# 阶段 3 C2：演练评估自动化（赛题功能④）
@ai_bp.route("/session/<session_id>/evaluate", methods=["GET"])
def evaluate_session(session_id):
    """基于对抗回合结果生成量化评估报告（攻击成功率/响应时效/威胁分布）。"""
    session = arena.get_session(session_id)
    if session is None:
        return jsonify({"error": f"会话不存在: {session_id}"}), 404
    rounds = session.get("rounds", [])
    if not rounds:
        return jsonify({"error": "尚无对抗回合，请先执行至少一轮"}), 400

    total = len(rounds)
    attack_won = sum(1 for r in rounds if r.get("result", {}).get("attack_won"))
    defense_won = sum(1 for r in rounds if r.get("result", {}).get("defense_won"))
    attack_success_rate = round(attack_won / total, 2) if total else 0.0

    # 威胁等级分布（按攻击 Agent 每轮风险等级）
    threat_dist = {}
    for r in rounds:
        level = r.get("attack_decision", {}).get("risk_level", "unknown")
        threat_dist[level] = threat_dist.get(level, 0) + 1

    # 防御响应时效（简单近似：按防御动作数加权）
    defense_actions = sum(
        len(r.get("defense_decision", {}).get("actions", [])) for r in rounds
    )
    avg_defense_actions = round(defense_actions / total, 2) if total else 0.0

    return jsonify(
        {
            "session_id": session_id,
            "total_rounds": total,
            "attack_success_rate": attack_success_rate,
            "attack_won": attack_won,
            "defense_won": defense_won,
            "defense_success_rate": round(defense_won / total, 2) if total else 0.0,
            "avg_defense_actions": avg_defense_actions,
            "threat_distribution": threat_dist,
            "verdict": "攻击方占优" if attack_success_rate > 0.5 else ("势均力敌" if attack_success_rate == 0.5 else "防御方占优"),
        }
    )
