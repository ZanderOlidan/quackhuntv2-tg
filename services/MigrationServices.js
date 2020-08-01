import { DB } from '../dal/config.js';
import { BOT } from './config.js';

const migrateTotals = async (msg) => {
    const groups = await DB.collection('groups').get();
    await Promise.all(groups.docs.map(async d => {
        let totalKills = 0;
        let totalRejects = 0;
        let totalFriends = 0;
        const users = await DB.collection('groups').doc(d.id).collection('users').get();
        users.docs.forEach(u => {
            totalKills += u.data().kills || 0;
            totalRejects += u.data().rejects || 0;
            totalFriends += u.data().friends || 0;
        });
        const content = {
            totalKills,
            totalRejects,
            totalFriends
        };

        return DB.collection('groups').doc(d.id).set(content, { merge: true });
    }));
    await BOT.sendMessage(msg.chat.id, 'Done');
};

export const Migrations = {
    migrateTotals
};
