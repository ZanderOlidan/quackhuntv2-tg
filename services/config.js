// eslint-disable-next-line no-unused-vars
import Tgfancy from 'tgfancy';
import { TELEGRAM_TOKEN, WEBHOOK_PORT, ENVIRONMENT, SIGNED_CERT, WEBHOOK_URL } from '../constants.js';
import { BootstrapServices } from './BootstrapServices.js';

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
            host: '127.0.0.1'
            // key: `${__dirname}/${SIGNED_KEY}`,
            // cert: `${__dirname}/${SIGNED_CERT}`
        };
    }
    // @ts-ignore
    const bot = new Tgfancy(t, botConfig);
    setBot(bot);
    if (ENVIRONMENT === 'production') {
        await BOT.setWebHook(`${WEBHOOK_URL}/bot${t}`, {
            certificate: `${SIGNED_CERT}`
        });
    } else {
        await BOT.setWebHook(`${WEBHOOK_URL}/bot${t}`);
        console.log('connected to', WEBHOOK_URL, 'port', WEBHOOK_PORT);
    }
    await BootstrapServices.showChangelog();
};

export {
    initializeBot,
    BOT
};
