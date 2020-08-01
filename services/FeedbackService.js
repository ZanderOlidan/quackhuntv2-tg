// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { sendMsg, escapeText } from '../services.js';
import { BOT } from './config.js';
import { OWNER_ID } from '../constants.js';

/**
 *
 * @param {TgApi.Message} msg
 * @param {*} match
 */
const send = async (msg, match) => {
    if (match[0].split(' ').length === 1) {
        await sendMsg(msg, `Pssst. Can't send an empty message.

<code>/say Kiss my ass, Dev!</code>

`);
    } else {
        /**
         *
         * @param {string} msg
         */
        const message = escapeText(match[1]);
        const ownerId = OWNER_ID;
        const getData = async () => {
            let content = '';
            if (msg.reply_to_message) {
                content += `----------
<i>${escapeText(msg.reply_to_message.text)}</i>
-----------`;
            }
            content += `
${msg.from.id}
${message}
<a href="tg://user?id=${msg.chat.id}">${msg.chat.id}</a> (${msg.chat.type === 'private' ? msg.chat.first_name : msg.chat.title ? msg.chat.title : ''})
`;
            await BOT.sendMessage(ownerId, content, { parse_mode: 'HTML' });
        };
        // send to dev
        await Promise.all([
            getData(),
            BOT.forwardMessage(ownerId, msg.chat.id, msg.message_id)
        ]);
        // send to user
        await sendMsg(msg, 'Message sent. Thanks! UwU ❤️');
    }
};

const reply = async (msg, match) => {
    const sp = match[1].split(' ');
    const location = sp[0];
    const message = sp.slice(1).join(' ');

    await BOT.sendMessage(location, message);
};

export const Feedback = {
    send,
    reply
};
