import { DB } from './config.js';
import * as TgApi from 'node-telegram-bot-api';

const RunningHuntsCollection = 'runninghunts';

/**
 * 
 * @param {TgApi.Message} ctx
 */
const deleteGroup = async (ctx) => {
    await DB.collection(RunningHuntsCollection).doc(`${ctx.chat.id}`).delete();
};

/**
 *
 * @param {TgApi.Message} ctx
 */
const upsert = async (ctx) => {
    await DB.collection(RunningHuntsCollection).doc(`${ctx.chat.id}`).set({
        active: true
    }, { merge: true });
};

const getAll = async () => {
    return DB.collection(RunningHuntsCollection).get();
};

/**
 *
 * @param {TgApi.Message} ctx
 * @param {string} d datestring
 */
const setNextDuck = async (ctx, d) => {
    await DB.collection(RunningHuntsCollection).doc(`${ctx.chat.id}`).set({
        nextDuck: d
    }, { merge: true });
};

export const RunningHuntsRepository = {
    deleteGroup,
    upsert,
    getAll,
    setNextDuck
};
