import { init as dbInit } from './dal/config.js';
import { doAction, startHunt, stopHunt, escCb } from './services.js';
import { BEF, BANG } from './textmentions.js';
import { BOT, initializeBot } from './services/config.js';
import { Stats } from './services/Stats.js';
import { Feedback } from './services/FeedbackService.js';
import { BootstrapServices } from './services/BootstrapServices.js';
import { Migrations } from './services/MigrationServices.js';

(async () => {
    dbInit();
    console.log('DB initialized');
    await initializeBot();
    console.log('bot initialized');

    try {
        BOT.onText(/\/starthunt/, escCb(startHunt));
        BOT.onText(/\/bang/, escCb(async msg => doAction(msg, BANG)));
        BOT.onText(/\/bef/, escCb(async msg => doAction(msg, BEF)));
        BOT.onText(/\/stophunt/, escCb(stopHunt));
        BOT.onText(/\/duckstats/, escCb(Stats.getUser));
        BOT.onText(/\/say ?(.+)?/, escCb(Feedback.send));
        BOT.onText(/\/groupstats/, escCb(Stats.getGroupStats));

        BOT.onText(/\/reply (.+)/, escCb(Feedback.reply));
        BOT.onText(/\/migrategroupstats/, escCb(Migrations.migrateTotals));
    } catch (e) {
        console.error(e);
    }

    try {
        await BootstrapServices.showChangelog();
        await BootstrapServices.initializeJobs();
        console.log('initiliazed jobs');
    } catch (e) {
        console.error(e);
    }
})();
