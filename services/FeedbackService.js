// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { sendMsg } from '../services.js';
import dayjs from 'dayjs';
import { BOT } from './config.js';
import { OWNER_ID } from '../constants.js';

/**
 *
 * @param {TgApi.Message} msg
 * @param {*} match
 */
const send = async (msg, match) => {
    if (match.length < 2) {
        await sendMsg(msg, `
Pssst. Can't give feedback with an empty message like so

<code>/say Kiss my ass, Dev!</code>

`);
    } else {
        const message = match[1];
        const ownerId = OWNER_ID;
        const date = dayjs(dayjs.unix(msg.date)).toDate().toLocaleString('en-GB', { timeZone: 'Asia/Hong_Kong' });
        // send to dev
        await BOT.sendMessage(ownerId, `
${date} - ${msg.from.first_name} ${msg.from.username || ''}

${message}

===================
`, { parse_mode: 'HTML' });
        // send to user
        await sendMsg(msg, 'Feedback sent. Thanks! UwU ❤️');
    }
};

export const Feedback = {
    send
};
