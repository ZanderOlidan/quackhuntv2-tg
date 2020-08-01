// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { DB } from './config.js';
import { GroupStatsModel } from './models/GroupStatsModel.js';
import { GroupModel } from './models/GroupModel.js';

const currentCollection = () => DB.collection('groups');
const ToModel = d => new GroupModel(d);

const getGroups = async () => {
    return currentCollection().get();
};

/**
 *
 * @param {string} chatId
 * @param {number} topCount
 *
 */
const getGroupStats = async (chatId, topCount) => {
    const groupUsers = currentCollection().doc(chatId).collection('users');
    const topKillers = groupUsers.orderBy('kills', 'desc').limit(topCount).get();
    const topRejections = groupUsers.orderBy('rejects', 'desc').limit(topCount).get();
    const topFriendly = groupUsers.orderBy('friends', 'desc').limit(topCount).get();

    const resRaw = await Promise.all([
        topKillers,
        topRejections,
        topFriendly
    ]);
    const result = resRaw.map(type => type.docs);

    return new GroupStatsModel({
        topKillers: result[0],
        topRejections: result[1],
        topFriendlies: result[2]
    });
};

const getGroup = async (chatId) => {
    const group = await currentCollection().doc(`${chatId}`).get();
    return ToModel(group.data());
};

export const GroupDal = {
    getGroups,
    getGroupStats,
    getGroup
};
