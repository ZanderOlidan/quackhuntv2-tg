/**
 * @type { {[key:string] : {releaseTime: string, duckMsgId: number }}}
 */
const duckTimerStorage = {};
const chatHasDuckOut = {};
const chatHasHunt = {};
const jobschedules = {};
const userCooldown = {};
const uniqueGroups = {}; // This one's for logging

export const State = {
    duckTimerStorage,
    chatHasDuckOut,
    chatHasHunt,
    jobschedules,
    userCooldown,
    uniqueGroups
};
