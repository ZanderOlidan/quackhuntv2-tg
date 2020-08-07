import * as TgApi from 'node-telegram-bot-api';
import { __dirname } from '../services.js';
import * as fs from 'fs';
import { BOT } from './config.js';
import { Exceptions } from './Exceptions.js';
import { GroupDal } from '../dal/GroupDal.js';
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
 *
 * @param {TgApi.Message} msg
 * @param {*} match
 *
 */
const announce = async (msg, match) => {
    try {
        const path = `${__dirname}/events/${match[1]}.json`;
        const contents = await fs.promises.readFile(path, { encoding: 'utf-8' });
        const contentsParsed = new EventInformationModel(JSON.parse(contents));
        try {
            const groups = await RunningHuntsDal.getAll();
            const requests = groups.docs.map(async g => {
                // if (contentsParsed.image && content.image !== '') {
                //     return BOT.sendPhoto
                // }
                const message = `
<b>${contentsParsed.title}</b>

${contentsParsed.content}`;

                console.log(message);
                await BOT.sendMessage(g.id, message, { parse_mode: 'HTML' });
            });
            await Promise.all(requests);
        } catch (e) {
            await Exceptions.handle403(e, g.id);
            console.error(`Cannot send changelog for ${g.id}`, e);
        }
    } catch (e) {
        console.error(e);
    }
};

export const Events = {
    announce
};
