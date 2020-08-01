// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { GroupUserDal } from '../dal/GroupUserDal.js';
import { BOT } from './config.js';
import { DUCKNAME } from '../textmentions.js';
import { sendMsg, escapeText } from '../services.js';
import { GroupDal } from '../dal/GroupDal.js';
import { GroupUserModel } from '../dal/models/GroupUserModel.js';

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

const getTopUserContent = (ctx, chatId, limit) => async (users, titleName, field) => {
    const sorted = users.sort((a, b) => a.data()[field] < b.data()[field]);
    const userContent = `
<b>Top ${users.length < limit ? users.length : limit} ${titleName}</b>
`;
    const userLineContent = async (user, index) => {
        let label;
        try {
            const chatmember = await BOT.getChatMember(chatId, user.id);
            label = chatmember.user.first_name || chatmember.user.username || user.id;
        } catch (e) {
            label = user.id;
        }

        const count = new GroupUserModel(user.data())[field];
        return `${index}. <a href="tg://user?id=${user.id}">${escapeText(label)}</a>: ${count}
`;
    };
    const usersStatResult = await Promise.all(sorted.map((u, i) => userLineContent(u, i + 1)));
    return userContent + usersStatResult.join('');
};

/**
 *
 * @param {TgApi.Message} msg
 */
const getGroupStats = async msg => {
    if (msg.chat.type === 'private') {
        return sendMsg(msg, 'No group stats when not in group.');
    }
    const limit = 5;
    const groupRequests = await Promise.all([
        GroupDal.getGroupStats(`${msg.chat.id}`, limit),
        GroupDal.getGroup(msg.chat.id)
    ]);
    const groupStats = groupRequests[0];
    const title = `
<b>🦆📈Group Stats for ${msg.chat.title}</b>
`;
    let content = title;

    const userContent = getTopUserContent(msg, msg.chat.id, limit);
    const subcategory = await Promise.all([
        userContent(groupStats.topKillers, 'Savages', 'kills'),
        userContent(groupStats.topFriendlies, 'Saviours', 'friends'),
        userContent(groupStats.topFriendlies, 'Rejections', 'rejects')
    ]);
    for (const cat of subcategory) {
        content += cat;
    }
    const group = groupRequests[1];
    content += `
<b>🔫 Total Kills:</b> ${group.totalKills}
<b>🥰 Total Friends:</b> ${group.totalFriends}
<b>🙅‍♀️ Total Rejections:</b> ${group.totalRejects}
`;
    await sendMsg(msg, content);
};

export const Stats = {
    getUser,
    getGroupStats
};
