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
        [key[actionType]]: INCREMENT_ONE
    };
    const user = currentUser(ctx);
    await user.set(content, { merge: true });
    const u = await user.get();
    return ToModel(u.data());
};

export const GroupUserDal = {
    incrementType,
    getUserStat
};