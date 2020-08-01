import { init as dbInit } from './dal/config.js';
import { doAction, startHunt, stopHunt } from './services.js';
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
        BOT.onText(/\/starthunt/, async (msg) => startHunt(msg));
        BOT.onText(/\/bang/, async msg => doAction(msg, BANG));
        BOT.onText(/\/bef/, async msg => doAction(msg, BEF));
        BOT.onText(/\/stophunt/, stopHunt);
        BOT.onText(/\/duckstats/, Stats.getUser);
        BOT.onText(/\/say ?(.+)?/, Feedback.send);
        BOT.onText(/\/groupstats/, Stats.getGroupStats);


        BOT.onText(/\/reply (.+)/, Feedback.reply);
        BOT.onText(/\/migrategroupstats/, Migrations.migrateTotals);
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
