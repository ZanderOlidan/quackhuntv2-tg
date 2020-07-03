import { DB, INCREMENT_ONE } from './index.js';

/**
 * @param {number} userId
 * @param {number} chatId
 */
export const kill = async (userId, chatId) => {
    const userContent = {
        kills: INCREMENT_ONE
    };
    const group = DB.collection(`users/${userId}/groups`).doc(`${chatId}`);
    await group.set(userContent, { merge: true });
    const g = await group.get();
    return g.data;
};

export const befriend = async (userId, chatId) => {

};

export const reject = async (userId, chatId) => {

};