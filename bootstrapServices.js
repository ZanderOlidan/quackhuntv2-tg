import { RunningHuntsRepository } from './dal/runninghunts.js';
import { State } from './memoryState.js';
import dayjs from 'dayjs';
import { scheduleDuckJob } from './services.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.extend(utc);

/**
 *
 * @param {string} chatId
 * @param {string} date
 */
const initializeHuntWorker = async (chatId, date) => {
    console.log(chatId);
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
    const all = await RunningHuntsRepository.getAll();

    await Promise.all(all.docs.map(d => initializeHuntWorker(d.id, d.data().nextDuck)));
};

export const BootstrapServices = {
    initializeJobs
};
