// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { GroupUserDal } from '../dal/GroupUserDal.js';
import { BOT } from './config.js';
import { DUCKNAME } from '../textmentions.js';
/**
 *
 * @param {TgApi.Message} msg
 */
const getUser = async (msg) => {
    const data = await GroupUserDal.getUserStat(msg);
    const name = msg.from.first_name || msg.from.username;
    const withS = amount => amount > 1 ? 's' : '';
    const content = `
<b>🦆📈Stats for <a href="tg://user?id=${msg.from.id}">${name}</a></b>

<b>😵Banged: </b> ${data.kills} ${DUCKNAME.toLowerCase() + withS(data.kills)}
<b>💖Friends: </b> ${data.friends} ${DUCKNAME.toLowerCase() + withS(data.friends)}
<b>🙅‍♀️Rejections: </b> ${data.rejects} ${DUCKNAME.toLowerCase() + withS(data.rejects)}

    `;

    return BOT.sendMessage(msg.chat.id, content, { parse_mode: 'HTML' });
};

export const Stats = {
    getUser
};
