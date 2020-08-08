import * as TgApi from 'node-telegram-bot-api';
import { __dirname } from '../services.js';
import * as fs from 'fs';
import { BOT } from './config.js';
import { Exceptions } from './Exceptions.js';
import { RunningHuntsDal } from '../dal/RunningHuntsDal.js';
import { EventInformationModel } from '../dal/models/EventInformationModel.js';

/**
 *
 * @param {TgApi.Message} msg
 */
// const toggleEvent = async (msg, eventName) => {
//     const group = await GroupDal.getGroup(msg.chat.id);
//     if (group.events[eventName]) {

//     }
// };

/**
 * TODO: MAKE THIS AS A SERVICE FOR CHANGELOG
 * @param {TgApi.Message} msg
 * @param {*} match
 *
 */
const announce = async (msg, match) => {
    try {
        const path = `${__dirname}/events/${match[1]}.json`;
        const contents = await fs.promises.readFile(path, { encoding: 'utf-8' });
        const contentsParsed = new EventInformationModel(JSON.parse(contents));
        const groups = await RunningHuntsDal.getAll();
        const requests = groups.docs.map(async g => {
            // if (contentsParsed.image && content.image !== '') {
            //     return BOT.sendPhoto
            // }
            const message = `
<b>${contentsParsed.title}</b>

${contentsParsed.content}`;

            try {
                await BOT.sendMessage(g.id, message, { parse_mode: 'HTML' });
            } catch (e) {
                await Exceptions.handle403(e, g.id);
                console.error(`Cannot send announcement for ${g.id}`, e.response.body.description);
            }
        });
        await Promise.all(requests);
    } catch (e) {
        if (e.response) {
            console.error(e.response.body.description);
        }
    }
};

export const Events = {
    announce
};
