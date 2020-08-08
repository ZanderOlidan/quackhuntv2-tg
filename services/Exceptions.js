import { RunningHuntsDal } from '../dal/RunningHuntsDal.js';
import { State } from '../memoryState.js';

const handle403 = async (error, chatId) => {
    if (error.code === 'ETELEGRAM' && error.response.body.error_code >= 400 && error.response.body.error_code < 500) {
        await RunningHuntsDal.deleteGroup(chatId);
        delete State.uniqueGroups[chatId];
    }
};

export const Exceptions = {
    handle403
};
