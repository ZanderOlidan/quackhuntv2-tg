import { RunningHuntsDal } from '../dal/RunningHuntsDal.js';

const handle403 = async (error, chatId) => {
    if (error.code === 'ETELEGRAM' && error.response.body.error_code >= 400 && error.response.body.erro_code < 500) {
        await RunningHuntsDal.deleteGroup(chatId);
    }
};

export const Exceptions = {
    handle403
};
