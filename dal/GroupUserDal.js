// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { INCREMENT_ONE, DB } from './config.js';
import { GroupUserModel } from './models/GroupUserModel.js';
import { GroupUserMapping } from './mappings/GroupUserMapping.js';

const currentUser = ctx => DB.collection(`groups/${ctx.chat.id}/users`).doc(`${ctx.from.id}`);
const ToModel = d => new GroupUserModel(d);

/**
 *
 * @param {TgApi.Message} ctx
 */
const getUserStat = async (ctx) => {
    const d = await currentUser(ctx).get();
    return ToModel(d.data());
};

/**
 *
 * @param {TgApi.Message} ctx
 * @param {"BANG" | "BEF" | "REJECT"} actionType
 */
const incrementType = async (ctx, actionType) => {
    const key = {
        BANG: GroupUserMapping.kills,
        BEF: GroupUserMapping.friends,
        REJECT: GroupUserMapping.rejects
    };

    const content = {
        [key[actionType]]: INCREMENT_ONE,
        name: ctx.from.first_name || ctx.from.username || ctx.from.id
    };
    const batch = DB.batch();
    const user = currentUser(ctx);
    batch.set(user, content, { merge: true });

    const groupStat = DB.collection('groups').doc(`${ctx.chat.id}`);
    const actionName = key[actionType][0].toUpperCase() + key[actionType].slice(1);
    batch.set(groupStat, { [`total${actionName}`]: INCREMENT_ONE }, { merge: true });
    await batch.commit();
    const u = await user.get();
    return ToModel(u.data());
};

/**
 *
 * @param {TgApi.Message} ctx
 * @param {GroupUserModel} content
 */
const updateUser = async (ctx, content) => {
    const user = currentUser(ctx);
    await user.set(content, { merge: true });
};

export const GroupUserDal = {
    incrementType,
    getUserStat,
    updateUser
};
