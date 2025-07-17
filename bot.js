require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { getDynamicMapData } = require("./foxholeService");
const { ICONS , USERS_NAMES} = require("./enums");
const { drawMapWithIcons } = require("./mapDrawer");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const TARGET_HEX = process.env.TARGET_HEX;

const ICON_TYPES = Object.keys(ICONS).map(Number);

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, "Задай питання яке тебе хвилює найбільше.", {
        reply_markup: {
            keyboard: [
                ["Отомщон лі вест гейт?"]
            ],
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(`${new Date().toISOString()}\t${USERS_NAMES[chatId] || "НЕВІДОМИЙ (" + chatId + ")" }: ${text}`);
    if (text === "Отомщон лі вест гейт?") {
        try {
            const data = await getDynamicMapData(TARGET_HEX);
            const items = data.mapItems || [];

            const filtered = items.filter(item => ICON_TYPES.includes(item.iconType));

            if (filtered.length === 0) {
                await bot.sendMessage(chatId, "❗ Немає обʼєктів для відображення.");
                return;
            }

            const colonialsCount = filtered.filter(item => item.teamId === "COLONIALS").length;

            let caption;
            if (colonialsCount > 0) {
                caption = `НІ!!! Кляті колоніали захопили ${colonialsCount} наш${colonialsCount > 1 ? "их" : "у"} баз${colonialsCount > 1 ? "и" : "у"}! Без твоєї допомоги ми не справимось!`;
            } else {
                caption = `Westgate наш! Завжди був, є і буде!`;
            }

            const buffer = await drawMapWithIcons(filtered);
            await bot.sendPhoto(chatId, buffer, { caption });
        } catch (err) {
            console.error(err);
            await bot.sendMessage(chatId, "❌ Помилка при створенні мапи.");
        }
    }
});
