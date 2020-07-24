import { init as dbInit } from './dal/config.js';
import { doAction, startHunt, stopHunt } from './services.js';
import { BEF, BANG } from './textmentions.js';
import { BOT, initializeBot } from './services/config.js';
import { Stats } from './services/Stats.js';

(async () => {
    dbInit();
    await initializeBot();
    BOT.onText(/(\.|\/)starthunt/, async (msg) => startHunt(msg));
    BOT.onText(/(\.|\/)bang/, async msg => doAction(msg, BANG));
    BOT.onText(/(\.|\/)bef/, async msg => doAction(msg, BEF));
    BOT.onText(/(\.|\/)stophunt/, async msg => stopHunt(msg));
    BOT.onText(/(\.|\/)duckstats/, async msg => Stats.getUser(msg));
})();
