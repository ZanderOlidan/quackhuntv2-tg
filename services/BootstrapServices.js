import { RunningHuntsDal } from '../dal/RunningHuntsDal.js';
import { State } from '../memoryState.js';
import dayjs from 'dayjs';
import { scheduleDuckJob, __dirname } from '../services.js';
import utc from 'dayjs/plugin/utc.js';
import { BOT } from './config.js';
import * as fs from 'fs';
import { VERSION } from '../constants.js';
import { Exceptions } from './Exceptions.js';
dayjs.extend(utc);

/**
 *
 * @param {string} chatId
 * @param {string} date
 */
const initializeHuntWorker = async (chatId, date) => {
    State.chatHasHunt[chatId] = true;

    const nextDuck = dayjs.utc(date);
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
        const isLatest = await RunningHuntsDal.isInLatestVersion(parseInt(g.id, 10), VERSION);
        if (!isLatest) {
            // open file
            const path = `${__dirname}/changelogs/${VERSION}.html`;
            const contents = await fs.promises.readFile(path, { encoding: 'utf-8' });
            try {
                await BOT.sendMessage(g.id, contents, { parse_mode: 'HTML' });
            } catch (e) {
                await Exceptions.handle403(e, g.id);
                console.error(`Cannot send changelog for ${g.id}`, e);
            }
        }
    }));
};

export const BootstrapServices = {
    initializeJobs,
    showChangelog
};
