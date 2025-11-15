# main.py
import os
import json
import logging
from pathlib import Path
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
    ContextTypes,
)

from renderer import render_scenario
from kb_loader import load_kb

# === Настройки ===
BOT_TOKEN = os.getenv("BOT_TOKEN")  # Берем из переменных окружения
ADMIN_CHAT_ID = int(os.getenv("ADMIN_CHAT_ID", "983339996"))
MODE = "polling"

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не установлен в переменных окружения!")

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Загружаем базу знаний при старте
kb = load_kb()
logger.info(f"Загружено {len(kb)} сценариев")

# === Классификатор (упрощённый) ===
def classify_query(text: str):
    text = text.lower()
    if any(word in text for word in ["преслед", "гонят", "тень", "машина за мной"]):
        return kb.get("INC-PURSUIT-001")
    if any(word in text for word in ["напад", "вооруж", "стрельба", "ограб"]):
        return kb.get("INC-ATTACK-001")
    if any(word in text for word in ["связь", "радио", "сигнал", "глонасс", "gsm"]):
        return kb.get("INC-COMMS-001")
    if any(word in text for word in ["оружие", "пистолет", "потеря", "украл"]):
        return kb.get("INC-WEAPON-001")
    if any(word in text for word in ["машина", "сломал", "двигатель", "тс", "авария"]):
        return kb.get("INC-VEHICLE-001")
    if any(word in text for word in ["подкуп", "взятка", "деньги дай"]):
        return kb.get("INC-BRIBE-001")
    if any(word in text for word in ["взрыв", "мина", "граната", "подозрительн"]):
        return kb.get("INC-BOMB-001")
    return None

# === Обработчики ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🛡️ *ПомогAI — ваш ассистент в критических ситуациях*\n\n"
        "Отправьте описание ситуации, например:\n"
        "• _«Меня преследуют»_\n"
        "• _«Отказ связи»_\n"
        "• _«Нападение»_\n\n"
        "⚠️ Все рекомендации соответствуют ФЗ-150, Приказам МВД и регламентам ЦБ.",
        parse_mode="MarkdownV2"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    text = update.message.text.strip()
    logger.info(f"[{user_id}] → {text}")

    try:
        scenario = classify_query(text)
        if not scenario:
            await update.message.reply_text(
                "⚠️ Ситуация не распознана\\. Соединяю с дежурным\\.\n\n"
                "Или опишите точнее: _«Вооружённое нападение»_, _«Преследование ТС»_, _«Потеря оружия»_\\.",
                parse_mode="MarkdownV2"
            )
            return

        reply = render_scenario(scenario)
        buttons = scenario.get("buttons", [])
        keyboard = []
        if buttons:
            keyboard = [
                [
                    InlineKeyboardButton(btn["text"], callback_data=btn["callback"])
                    for btn in buttons[:2]
                ]
            ]

        await update.message.reply_text(
    reply,
    parse_mode="HTML",
    disable_web_page_preview=True,
        )
        logger.info(f"[{user_id}] ← Отправлен сценарий: {scenario['id']}")

    except Exception as e:
        logger.error(f"Ошибка при обработке сообщения: {e}", exc_info=True)
        await update.message.reply_text(
            "❌ Произошла ошибка. Попробуйте позже или обратитесь к администратору.",
            parse_mode="MarkdownV2"
        )

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id
    data = query.data

    if data == "report_dp_alerted":
        await query.edit_message_text("✅ **Дежурный и ЦМИ оповещёны**\n\nОжидайте подтверждения связи\\.", parse_mode="MarkdownV2")
        logger.info(f"[{user_id}] → action=dp_alerted")

    elif data == "request_convoy":
        await query.edit_message_text("🚨 **Запрос на сопровождение отправлен**\n\nГруппа поддержки выезжает\\.", parse_mode="MarkdownV2")
        if ADMIN_CHAT_ID:
            await context.bot.send_message(
                chat_id=ADMIN_CHAT_ID,
                text=f"❗ SOS от {user_id}: запрошено сопровождение",
            )
        logger.info(f"[{user_id}] → action=request_convoy")

# === Запуск ===
def main():
    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_handler(CallbackQueryHandler(handle_callback))

    if MODE == "webhook":
        WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
        WEBHOOK_PATH = os.getenv("WEBHOOK_PATH", "/exec")
        PORT = int(os.getenv("PORT", 8080))
        app.run_webhook(
            listen="0.0.0.0",
            port=PORT,
            url_path=WEBHOOK_PATH.lstrip("/"),
            webhook_url=f"{WEBHOOK_URL}{WEBHOOK_PATH}",
        )
        logger.info(f"Webhook запущен на {WEBHOOK_URL}{WEBHOOK_PATH}")
    else:
        app.run_polling()
        logger.info("Polling запущен")

if __name__ == "__main__":
    main()