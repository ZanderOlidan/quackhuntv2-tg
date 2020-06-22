import Tgfancy from "tgfancy";
import { setBot, sendMsg, hasHunt, setHasHunt, scheduleNextDuck, doAction } from "./services.js";
import { START_HUNT, BEF, BANG } from "./textmentions.js";
import { WEBHOOK_URL, TELEGRAM_TOKEN, WEBHOOK_PORT } from "./config.js";



(async () => {
    try{
        const t = TELEGRAM_TOKEN;
        const bot = new Tgfancy(t, {
            tgfancy: {
                orderedSending: true,
                ratelimiting: true,
            },
            webHook: {
                port: WEBHOOK_PORT,
            },
        });
        setBot(bot);

        await bot.setWebHook(`${WEBHOOK_URL}/bot${t}`);

        bot.onText(/\/starthunt/, async (msg) => {
            await bot.sendMessage(msg.chat.id, START_HUNT);
            setHasHunt(true);
            scheduleNextDuck(msg);
        });

        bot.onText(/\/bang/, async msg => {
            await doAction(msg, BANG);
        });

        bot.onText(/\/bef/, async msg => {
            await doAction(msg, BEF)
        });

        bot.onText(/\/stophunt/, async msg => {
            if (hasHunt) {
                setHasHunt(false);
                await sendMsg(msg, "Hunt over. Start again with /starthunt");
            }
        })

    } catch (e) {
        console.log(e);
    }
})();