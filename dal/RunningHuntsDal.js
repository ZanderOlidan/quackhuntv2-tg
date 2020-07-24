import { DB } from './config.js';
// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';

const RunningHuntsCollection = 'runninghunts';
const currentCollection = () => DB.collection(RunningHuntsCollection);
/**
 * @param {number} chatId
 */
const currentDoc = chatId => currentCollection().doc(`${chatId}`);

/**
 *
 * @param {TgApi.Message} ctx
 */
const deleteGroup = async (ctx) => {
    await currentDoc(ctx.chat.id).delete();
};

/**
 *
 * @param {TgApi.Message} ctx
 */
const upsert = async (ctx) => {
    await currentDoc(ctx.chat.id).set({
        active: true
    }, { merge: true });
};

const getAll = async () => {
    return currentCollection().get();
};

/**
 *
 * @param {TgApi.Message} ctx
 * @param {string} d datestring
 */
const setNextDuck = async (ctx, d) => {
    await currentCollection().doc(`${ctx.chat.id}`).set({
        nextDuck: d
    }, { merge: true });
};

// -1001220054056
/**
 *
 * @param {number} chatId
 * @param {string} version
 */
const isInLatestVersion = async (chatId, version) => {
    return DB.runTransaction(async (t) => {
        const group = await t.get(currentDoc(chatId));
        if (!group.exists) {
            t.set(currentDoc(chatId), { version }, { merge: true });
            return false;
        }

        if (group.data().version !== version) {
            t.set(currentDoc(chatId), { version }, { merge: true });
            return false;
        }

        return true;
    });
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {string} version
 */
const setVersion = async (msg, version) => {
    await currentDoc(msg.chat.id).set({ version }, { merge: true });
};

export const RunningHuntsDal = {
    deleteGroup,
    upsert,
    getAll,
    setNextDuck,
    isInLatestVersion,
    setVersion
};
