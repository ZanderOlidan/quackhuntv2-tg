import Tgfancy from 'tgfancy';
import { init as dbInit } from './dal/index.js';
import { TELEGRAM_TOKEN, WEBHOOK_PORT, SIGNED_KEY, SIGNED_CERT, ENVIRONMENT, WEBHOOK_URL } from './constants.js';
import { setBot, doAction, __dirname, startHunt, stopHunt } from './services.js';
import { BEF, BANG } from './textmentions.js';
import { BootstrapServices } from './bootstrapServices.js';

(async () => {
    try {
        dbInit();
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
                key: `${__dirname}/${SIGNED_KEY}`,
                cert: `${__dirname}/${SIGNED_CERT}`
            };
        }
        // @ts-ignore
        const bot = new Tgfancy(t, botConfig);
        setBot(bot);

        if (ENVIRONMENT === 'production') {
            await bot.setWebHook(`${WEBHOOK_URL}:${WEBHOOK_PORT}/bot${t}`, {
                certificate: `${__dirname}/${SIGNED_CERT}`
            });
        } else {
            await bot.setWebHook(`${WEBHOOK_URL}/bot${t}`);
        }

        await BootstrapServices.initializeJobs();

        bot.onText(/(\.|\/)starthunt/, async (msg) => {
            await startHunt(msg);
        });

        bot.onText(/(\.|\/)bang/, async msg => {
            await doAction(msg, BANG);
        });

        bot.onText(/(\.|\/)bef/, async msg => {
            await doAction(msg, BEF);
        });

        bot.onText(/(\.|\/)stophunt/, async msg => {
            await stopHunt(msg);
        });
    } catch (e) {
        console.log(e);
    }
})();
