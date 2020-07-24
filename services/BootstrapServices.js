import { RunningHuntsDal } from '../dal/RunningHuntsDal.js';
import { State } from '../memoryState.js';
import dayjs from 'dayjs';
import { scheduleDuckJob, __dirname } from '../services.js';
import utc from 'dayjs/plugin/utc.js';
import { BOT } from './config.js';
import * as fs from 'fs';
dayjs.extend(utc);

/**
 *
 * @param {string} chatId
 * @param {string} date
 */
const initializeHuntWorker = async (chatId, date) => {
    State.chatHasHunt[chatId] = true;

    const nextDuck = dayjs.utc(date);
    // check for hanging duck after the restart
    if (nextDuck.isBefore(dayjs())) {
        await scheduleDuckJob(chatId, dayjs().add(2, 's').toDate());
    } else {
        await scheduleDuckJob(chatId, nextDuck.toDate());
    }
};

const initializeJobs = async () => {
    const all = await RunningHuntsDal.getAll();
    await Promise.all(all.docs.map(d => initializeHuntWorker(d.id, d.data().nextDuck)));
};

const showChangelog = async () => {
    const all = await RunningHuntsDal.getAll();
    await Promise.all(all.docs.map(async g => {
        const isLatest = await RunningHuntsDal.isInLatestVersion(parseInt(g.id, 10), process.env.npm_package_version);
        if (!isLatest) {
            // open file
            const path = `${__dirname}/changelogs/${process.env.npm_package_version}.html`;
            const contents = await fs.promises.readFile(path, { encoding: 'utf-8' });
            await BOT.sendMessage(g.id, contents, { parse_mode: 'HTML' });
        }
    }));
};

export const BootstrapServices = {
    initializeJobs,
    showChangelog
};