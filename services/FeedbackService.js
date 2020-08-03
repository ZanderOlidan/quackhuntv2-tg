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
    if (match[0].split(' ').length === 1 && !msg.reply_to_message) {
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
                if (msg.reply_to_message.text) {
                    content += `----------
<i>${escapeText(msg.reply_to_message.text)}</i>
-----------`;
                }
                if (msg.reply_to_message.photo) {
                    const photoMeta = msg.reply_to_message.photo;
                    await BOT.sendPhoto(ownerId, photoMeta[0].file_id);
                }

                if (msg.reply_to_message.voice) {
                    await BOT.sendVoice(ownerId, msg.reply_to_message.voice.file_id);
                }
            }
            content += `
MessageId: ${msg.message_id}
UserId: ${msg.from.id}
Content: ${message || ''}
<a href="tg://${msg.chat.id}">${msg.chat.id}</a> (${msg.chat.type === 'private' ? msg.chat.first_name : msg.chat.title ? msg.chat.title : ''})
`;
            await BOT.sendMessage(ownerId, content, {
                parse_mode: 'HTML'
            });
        };
        // send to dev
        await Promise.all([
            getData(),
            BOT.forwardMessage(ownerId, msg.chat.id, msg.message_id)
        ]);
        // send to user
        await BOT.sendMessage(msg.chat.id, 'Message sent. Thanks! ❤️', {
            reply_to_message_id: msg.message_id
        });
    }
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {*} match
 */
const reply = async (msg, match) => {
    const sp = match[1].split(' ');
    const location = sp[0];
    const message = sp.slice(1).join(' ');
    if (msg.reply_to_message && msg.reply_to_message.photo) {
        const photo = msg.reply_to_message.photo;
        return BOT.sendPhoto(location, photo[0].file_id, { caption: message || '' });
    }

    await BOT.sendMessage(location, message);
};

/**
 *
 * @param {TgApi.Message} msg
 */
const sendDice = async (msg, match) => {
    const sp = match[1].split(' ');
    const location = sp[0];
    if (!location) {
        return BOT.sendMessage(msg.chat.id, 'dumbass add location');
    }
    const res = await BOT.sendDice(location, {
        emoji: '🏀'
    });
    // @ts-ignore
    await BOT.sendMessage(res.dice.value);
};
export const Feedback = {
    send,
    reply,
    sendDice
};
