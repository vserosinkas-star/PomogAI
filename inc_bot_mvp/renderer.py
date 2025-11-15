# renderer.py
import re

def escape_markdown_v2(text: str) -> str:
    """Экранирует спецсимволы для Telegram MarkdownV2, сохраняя **жирный** через *...*"""
    # Разбиваем на части: *жирный текст* — не трогаем
    import re
    parts = re.split(r'(\*.*?\*)', text)
    result = []
    for part in parts:
        if part.startswith('*') and part.endswith('*'):
            # Это жирный фрагмент — только удалим лишние *
            clean = part[1:-1]
            # Экранируем внутри, кроме букв/цифр/пробелов
            clean = re.sub(r'([_\[\]\(\)~`>#+\-=|{}.!])', r'\\\1', clean)
            result.append(f'*{clean}*')
        else:
            # Обычный текст — экранируем все спецсимволы
            part = re.sub(r'([_\[\]\(\)~`>#+\-=|{}.!])', r'\\\1', part)
            result.append(part)
    return ''.join(result)

def render_scenario(scenario: dict) -> str:
    priority_emoji = {
        "critical": "🚨",
        "high": "⚠️",
        "medium": "🟠"
    }.get(scenario.get("priority"), "ℹ️")

    title = scenario["title"]
    reply = f"{priority_emoji} <b>КРИТИЧЕСКАЯ СИТУАЦИЯ: {title}</b>\n\n"

    for step in scenario.get("steps", []):
        if step.startswith("📍"):
            reply += step + "\n"
            for g in scenario.get("gosbs", []):
                city = g["city"]
                address = g["address"]
                reply += f"<b>📍 {city}, {address} </b>\n"
        else:
            reply += f"🔹 {step}\n"

    sources = scenario.get("sources", [])
    if sources:
        reply += "\n📚 <b>Источники:</b>\n"
        for src in sources:
            reply += f"• {src}\n"

    return reply.strip()