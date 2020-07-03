import Tgfancy from 'tgfancy';
import { setBot, sendMsg, hasHunt, setHasHunt, scheduleNextDuck, doAction } from './services.js';
import { START_HUNT, BEF, BANG } from './textmentions.js';
import { TELEGRAM_TOKEN, WEBHOOK_PORT, SIGNED_KEY, SIGNED_CERT, ENVIRONMENT, WEBHOOK_URL } from './config.js';
require('dotenv').config();

(async () => {
    try {
        const t = TELEGRAM_TOKEN;
        const botConfig = {
            tgfancy: {
                orderedSending: true,
                ratelimiting: true
            },
            webHook: {
                port: WEBHOOK_PORT
            }
        };
        if (ENVIRONMENT === 'production') {
            botConfig.webHook = {
                port: WEBHOOK_PORT,
                key: SIGNED_KEY,
                cert: SIGNED_CERT
            };
        }
        // @ts-ignore
        const bot = new Tgfancy(t, botConfig);
        setBot(bot);

        if (ENVIRONMENT === 'production') {
            await bot.setWebHook(`${WEBHOOK_URL}:${WEBHOOK_PORT}/bot${t}`, {
                certificate: SIGNED_CERT
            });
        } else {
            await bot.setWebHook(`${WEBHOOK_URL}/bot${t}`);
        }

        bot.onText(/\/starthunt/, async (msg) => {
            await bot.sendMessage(msg.chat.id, START_HUNT);
            setHasHunt(true);
            scheduleNextDuck(msg);
        });

        bot.onText(/\/bang/, async msg => {
            await doAction(msg, BANG);
        });

        bot.onText(/\/bef/, async msg => {
            await doAction(msg, BEF);
        });

        bot.onText(/\/stophunt/, async msg => {
            if (hasHunt) {
                setHasHunt(false);
                await sendMsg(msg, 'Hunt over. Start again with /starthunt');
            }
        });
    } catch (e) {
        console.log(e);
    }
})();
