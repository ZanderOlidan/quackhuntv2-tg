import { DB, INCREMENT_ONE } from './index.js';
import { BANG } from '../textmentions.js';

export const kill = async (ctx) => {
    const userContent = {
        kills: INCREMENT_ONE
    };
    const group = DB.collection(`users/${ctx.from.id}/groups`).doc(`${ctx.chat.id}`);
    await group.set(userContent, { merge: true });
    const g = await group.get();
    return g.data;
};

export const befriend = async (ctx) => {
    const userContent = {
        friends: INCREMENT_ONE
    };
    const group = DB.collection(`users/${ctx.from.id}/groups`).doc(`${ctx.chat.id}`);
    await group.set(userContent, { merge: true });
    const g = await group.get();
    return g.data;
};

export const reject = async (ctx) => {
    const userContent = {
        rejects: INCREMENT_ONE
    };
    const group = DB.collection(`users/${ctx.from.id}/groups`).doc(`${ctx.chat.id}`);
    await group.set(userContent, { merge: true });
    const g = await group.get();
    return g.data;
};

export const incrementTypeDal = async (ctx, actionType) => {
    const key = {
        BANG: 'kills',
        BEF: 'friends',
        REJECT: 'rejects'
    };

    const content = {
        [key[actionType]]: INCREMENT_ONE
    };
    // const group = DB.collection(`users/${ctx.from.id}/groups`).doc(`${ctx.chat.id}`);
    const group = DB.collection(`groups/${ctx.chat.id}/users`).doc(`${ctx.from.id}`);
    await group.set(content, { merge: true });
    const g = await group.get();
    return g.data;
};
