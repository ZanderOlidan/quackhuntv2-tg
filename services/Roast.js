import * as TgApi from 'node-telegram-bot-api';
import phin from 'phin';
import { BOT } from './config.js';

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

export const Roaster = {
    roast
};
