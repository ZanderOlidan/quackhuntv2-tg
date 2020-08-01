// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import Schedule from 'node-schedule';
import { FAIL_RATE, TO_WINDOW, FROM_WINDOW, USER_MESSAGE_COOLDOWN, VERSION, FRIYAY } from './constants.js';
import { NO_HUNT_IN_GAME, BANG_SUCCESS, BANG_NONEXISTENT, BANG_FAIL_MESSAGES, BEF_SUCCESS, BEF_NONEXISTENT, BEF_FAIL_MESSAGES, START_HUNT, HUNT_STARTED, COOLDOWN_MESSAGES, SELFHUNT } from './textmentions.js';
import dayjs from 'dayjs';
import { BOT } from './services/config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { RunningHuntsDal } from './dal/RunningHuntsDal.js';
import { State } from './memoryState.js';
import utc from 'dayjs/plugin/utc.js';
import { GroupUserDal } from './dal/GroupUserDal.js';
import { Exceptions } from './services/Exceptions.js';

dayjs.extend(utc);
/**
 *
 * @param {TgApi.Message} msg
 * @param {boolean} isOut
 */
export const setDuckOut = (msg, isOut) => {
    State.chatHasDuckOut[msg.chat.id] = isOut;
};

/**
 *
 * @param {TgApi.Message} msg
 */
export const isDuckOut = (msg) => {
    return !!State.chatHasDuckOut[msg.chat.id];
};

/**
 *
 * @param {TgApi.Message} ctx
 * @param {boolean} isHunting
 */
export const setHasHunt = (ctx, isHunting) => {
    State.chatHasHunt[ctx.chat.id] = isHunting;
};

export const hasHunt = (ctx) => {
    return State.chatHasHunt[ctx.chat.id];
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {string} messageContent
 */
export const sendMsg = async (msg, messageContent) => {
    const name = msg.from.first_name || msg.from.username;
    name
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&/g, '&amp;');
    const content = `(<a href="tg://user?id=${msg.from.id}">${name}</a>) ${messageContent}`;

    await BOT.sendMessage(msg.chat.id, content, { parse_mode: 'HTML' });
};

/**
 *
 * @param {TgApi.Message} msg
 */
export const scheduleNextDuck = async (msg) => {
    let window = {
        f: FROM_WINDOW,
        t: TO_WINDOW
    };
    // Get second half of friday
    if (dayjs().day() === 5 && dayjs().hour() >= 12 && FRIYAY) {
        window = {
            f: FROM_WINDOW / FRIYAY,
            t: TO_WINDOW / FRIYAY
        };
    }
    const rangeFrom = dayjs().add(window.f, 's').unix();
    const rangeTo = dayjs().add(window.t, 's').unix();
    const randomNumber = Math.floor(Math.random() * (rangeTo - rangeFrom) + rangeFrom);

    const d = dayjs.unix(randomNumber);

    State.uniqueGroups[msg.chat.id] = msg.chat.title;
    console.log(msg.chat.title, msg.chat.id, d.toISOString(), 'ChatCount -', Object.keys(State.uniqueGroups).length);

    setDuckOut(msg, false);
    await RunningHuntsDal.setNextDuck(msg, d.toISOString());

    await scheduleDuckJob(`${msg.chat.id}`, d.toDate());
};

/**
 *
 * @param {string} chatId
 * @param {Date} date
 */
export const scheduleDuckJob = async (chatId, date) => {
    State.jobschedules[chatId] = Schedule.scheduleJob(date, async () => {
        if (State.chatHasHunt[chatId]) {
            State.duckTimerStorage[chatId] = dayjs().toISOString();
            try {
                await BOT.sendMessage(chatId, '・゜゜・。🦆QUACK!・゜゜・。');
            } catch (e) {
                await Exceptions.handle403(e, chatId);
                console.error(`Cannot schedule duck for ${chatId}`, e);
            }
            State.chatHasDuckOut[chatId] = true;
        }
    });
};

/**
 *
 * @param {string[]} list
 */
export const generateMessage = (list) => {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
};

const isSuccessAction = () => {
    const rand = Math.random();
    return rand > FAIL_RATE;
};

const isInCooldown = (msg) => {
    const userCd = State.userCooldown[msg.from.id];
    if (userCd) {
        if (dayjs(userCd).isAfter(dayjs())) {
            return dayjs(userCd).diff(dayjs(), 's', true);
        }
    }
    return false;
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {"BANG" | "BEF" | "REJECT"} actionType
 */
export const doAction = async (msg, actionType) => {
    const MESSAGES = {
        BANG: {
            SUCCESS: () => generateMessage(BANG_SUCCESS),
            NONEXISTENT: () => generateMessage(BANG_NONEXISTENT),
            FAIL_MESSAGE: () => generateMessage(BANG_FAIL_MESSAGES)
        },
        BEF: {
            SUCCESS: () => generateMessage(BEF_SUCCESS),
            NONEXISTENT: () => generateMessage(BEF_NONEXISTENT),
            FAIL_MESSAGE: () => generateMessage(BEF_FAIL_MESSAGES)
        }
    };

    if (!hasHunt(msg)) {
        return sendMsg(msg, NO_HUNT_IN_GAME);
    }

    if (!isDuckOut(msg)) {
        return sendMsg(msg, MESSAGES[actionType].NONEXISTENT());
    }

    const inCd = isInCooldown(msg);
    if (inCd) {
        return sendMsg(msg, `${generateMessage(COOLDOWN_MESSAGES)} ${inCd} seconds`);
    }

    if (isSuccessAction()) {
        scheduleNextDuck(msg);
        const difference = dayjs().diff(State.duckTimerStorage[msg.chat.id], 's', true);

        const newVal = await GroupUserDal.incrementType(msg, actionType);
        const term = {
            BANG: {
                term: 'killed',
                dbField: 'kills'
            },
            BEF: {
                term: 'befriended',
                dbField: 'friends'
            }
        };
        return sendMsg(msg, `${MESSAGES[actionType].SUCCESS()} ${difference} seconds. You have ${term[actionType].term} ${newVal[term[actionType].dbField]} ducks.`);
    } else {
        await GroupUserDal.incrementType(msg, 'REJECT');
        State.userCooldown[msg.from.id] = dayjs().add(USER_MESSAGE_COOLDOWN, 's');
        return await sendMsg(msg, `${MESSAGES[actionType].FAIL_MESSAGE()} Try again in ${USER_MESSAGE_COOLDOWN} seconds`);
    }
};

/**
 *
 * @param {TgApi.Message} msg
 */
export const startHunt = async (msg, isManualStart = true) => {
    if (!hasHunt(msg)) {
        if (msg.chat.type === 'private') {
            return BOT.sendMessage(msg.chat.id, SELFHUNT);
        }
        if (isManualStart) {
            await BOT.sendMessage(msg.chat.id, START_HUNT);
        }
        await RunningHuntsDal.setVersion(msg, VERSION);
        setHasHunt(msg, true);
        // add hunt
        scheduleNextDuck(msg);
    } else {
        if (isManualStart) {
            await BOT.sendMessage(msg.chat.id, HUNT_STARTED);
        }
    }
};

/**
 *
 * @param {TgApi.Message} msg
 */
export const stopHunt = async (msg) => {
    if (hasHunt(msg)) {
        setHasHunt(msg, false);
        // delete from db
        await RunningHuntsDal.deleteGroup(msg.chat.id);
        // remove job from memory
        const groupSchedule = State.jobschedules[msg.chat.id];
        if (groupSchedule) {
            groupSchedule.cancel();
        }
    }
    await sendMsg(msg, 'Hunt over. Start again with /starthunt');
};

// @ts-ignore
export const __dirname = dirname(fileURLToPath(import.meta.url));

export const escapeText = text => text
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/&/g, '');

export const escCb = (cb) => (...msg) => {
    msg[0].from.first_name = escapeText(msg[0].from.first_name);
    msg[0].chat.title = escapeText(msg[0].chat.title);
    msg[0].text = escapeText(msg[0].text);
    // eslint-disable-next-line standard/no-callback-literal
    return cb(...msg);
};
