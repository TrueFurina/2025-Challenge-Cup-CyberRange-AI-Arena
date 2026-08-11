"""LLM 统一客户端（fail-open）。

从 2026 Security-Agent ai/client.py 的模式移植，精简为攻防推演场景：
- 支持 DeepSeek / Qwen / 任意 OpenAI 兼容端点
- 无 API Key / 网络异常 / 解析失败 → 返回 None，调用方走规则兜底
- 防御性 JSON 解析：剥离代码围栏 + 提取 JSON 对象
"""
from __future__ import annotations

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://api.deepseek.com/v1"
DEFAULT_MODEL = "deepseek-chat"


def _resolve_settings() -> dict:
    """解析 LLM 设置：环境变量优先，其次默认值。"""
    api_key = (
        os.environ.get("DEEPSEEK_API_KEY")
        or os.environ.get("LLM_API_KEY")
        or ""
    )
    return {
        "api_key": api_key,
        "base_url": os.environ.get("LLM_BASE_URL", DEFAULT_BASE_URL),
        "model": os.environ.get("LLM_MODEL", DEFAULT_MODEL),
    }


def _post_chat(messages: list[dict], settings: dict, temperature: float, max_tokens: int) -> Optional[str]:
    """调用 OpenAI 兼容 chat/completions 端点。"""
    import requests  # 项目已依赖 requests

    payload = {
        "model": settings["model"],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    headers = {
        "Authorization": f"Bearer {settings['api_key']}",
        "Content-Type": "application/json",
    }
    resp = requests.post(
        f"{settings['base_url'].rstrip('/')}/chat/completions",
        json=payload,
        headers=headers,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        logger.warning("LLM 响应结构异常: %s", str(data)[:200])
        return None


def ai_chat(
    messages: list[dict],
    system: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> Optional[str]:
    """统一 LLM 调用（失败开放，绝不抛出异常）。

    Args:
        messages: OpenAI 风格消息列表
        system: 可选系统提示词
        temperature: 采样温度
        max_tokens: 最大输出 token

    Returns:
        回复文本；任何失败返回 None。
    """
    if not messages:
        return None
    try:
        settings = _resolve_settings()
        if not settings["api_key"]:
            logger.warning("未配置 LLM API Key，AI 能力不可用（走规则兜底）")
            return None
        if system:
            messages = [{"role": "system", "content": system}] + list(messages)
        return _post_chat(messages, settings, temperature, max_tokens)
    except Exception as exc:  # noqa: BLE001 - fail-open
        logger.warning("AI 调用失败（fail-open 返回 None）: %s", exc)
        return None


def ai_chat_json(
    messages: list[dict],
    system: Optional[str] = None,
    temperature: float = 0.1,
    max_tokens: int = 1024,
) -> Optional[dict]:
    """调用 LLM 并解析 JSON 对象回复（失败开放）。"""
    content = ai_chat(messages, system=system, temperature=temperature, max_tokens=max_tokens)
    if content is None:
        return None
    return extract_json_object(content)


def extract_json_object(text: str) -> Optional[dict]:
    """剥离 ```json 围栏并提取首个完整 JSON 对象（防御性解析）。"""
    try:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            # 剥离代码围栏
            lines = cleaned.splitlines()
            lines = [line for line in lines if not line.strip().startswith("```")]
            cleaned = "\n".join(lines).strip()
        # 尝试直接解析
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    # 尝试截取首尾花括号
    try:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError:
        pass
    logger.warning("LLM 返回内容无法解析为 JSON 对象")
    return None
