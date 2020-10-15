import * as TgApi from 'node-telegram-bot-api';
import phin from 'phin';
import { escapeText, sendMsg } from '../../services.js';
import { BOT } from '../config.js';
import { makeCompliment } from './Complimenter.js';
import { getSabihin } from './Sabihin.js';

/**
 *
 * @param {TgApi.Message} msg
 */
const roast = async (msg) => {
    let username = msg.from.first_name;
    if (msg.reply_to_message) {
        username = msg.reply_to_message.from.first_name;
    }
    const insultUrl = `https://insult.mattbas.org/api/insult.json?template=%09You+are+as+%3Cadjective%3E+as+%3Carticle+target%3Dadj1%3E+%3Cadjective+min%3D1+max%3D2+id%3Dadj1%3E+%3Camount%3E+of+%3Cadjective+min%3D1+max%3D2%3E+%3Canimal%3E+%3Canimal_part%3E&who=${username}`;
    const request = await phin({
        url: insultUrl,
        parse: 'json'
    });
    const insult = request.body.insult;
    console.log(insult);
    await BOT.sendMessage(msg.chat.id, insult);
};

/**
 *
 * @param {TgApi.Message} msg
 */
const giveCompliment = async (msg) => {
    let username = msg.from.first_name || msg.from.last_name;
    if (msg.reply_to_message) {
        username = msg.reply_to_message.from.first_name || msg.reply_to_message.from.last_name;
    }
    const compliment = makeCompliment(username);
    await BOT.sendMessage(msg.chat.id, compliment);
};

/**
 *
 * @param {TgApi.Message} msg
 */
const sabihin = async (msg, match) => {
    if (match[0].split(' ').length === 1 && !msg.reply_to_message) {
        await sendMsg(msg, 'Pssst. Can\'t sabi an empty message.');
        return;
    }

    let text;
    if (msg.reply_to_message && msg.reply_to_message.text) {
        text = escapeText(msg.reply_to_message.text);
    } else {
        text = escapeText(match[1]);
    }
    const msgSplit = text.split(' ').filter(n => n);

    if (msgSplit.length > 25) {
        await sendMsg(msg, 'Message too mahaba. Cannot sabi.');
        return;
    }
    const finalMessage = msgSplit.join(' ');

    await BOT.sendVoice(msg.chat.id, await getSabihin(finalMessage));
};

export const Thinks = {
    roast,
    giveCompliment,
    sabihin
};
