// eslint-disable-next-line no-unused-vars
import Tgfancy from 'tgfancy';
import { TELEGRAM_TOKEN, WEBHOOK_PORT, ENVIRONMENT, SIGNED_KEY, SIGNED_CERT, WEBHOOK_URL } from '../constants.js';
import { BootstrapServices } from '../bootstrapServices.js';

/**
 * @type {Tgfancy}
 */
let BOT;

/**
 * @param {Tgfancy} b
 */
const setBot = (b) => {
    BOT = b;
};

const initializeBot = async () => {
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
        await BOT.setWebHook(`${WEBHOOK_URL}:${WEBHOOK_PORT}/bot${t}`, {
            certificate: `${__dirname}/${SIGNED_CERT}`
        });
        await BootstrapServices.initializeJobs();
    } else {
        await BOT.setWebHook(`${WEBHOOK_URL}/bot${t}`);
    }
};

export {
    initializeBot,
    BOT
};
