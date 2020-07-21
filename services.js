import * as TgApi from 'node-telegram-bot-api';
import Schedule from 'node-schedule';
import { FAIL_RATE, TO_WINDOW, FROM_WINDOW, USER_MESSAGE_COOLDOWN } from './constants.js';
import { NO_HUNT_IN_GAME, BANG_SUCCESS, BANG_NONEXISTENT, BANG_FAIL_MESSAGES, BEF_SUCCESS, BEF_NONEXISTENT, BEF_FAIL_MESSAGES, BANG, BEF, START_HUNT, HUNT_STARTED, COOLDOWN_MESSAGES } from './textmentions.js';
import dayjs from 'dayjs';
import Tgfancy from 'tgfancy';
import { incrementTypeDal } from './dal/increment.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { RunningHuntsRepository } from './dal/runninghunts.js';
import { State } from './memoryState.js';
import utc from 'dayjs/plugin/utc.js';
import { group } from 'console';

dayjs.extend(utc);
/**
 * @type {Tgfancy}
 */
let BOT;

/**
 * @param {Tgfancy} b
 */
export const setBot = (b) => {
    BOT = b;
};

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
    const content = `(<a href="tg://user?id=${msg.from.id}">${name}</a>) ${messageContent}`;

    await BOT.sendMessage(msg.chat.id, content, { parse_mode: 'HTML' });
};

/**
 * 
 * @param {TgApi.Message} msg 
 */
export const scheduleNextDuck = async (msg) => {
    const rangeFrom = dayjs().add(FROM_WINDOW, 's').unix();
    const rangeTo = dayjs().add(TO_WINDOW, 's').unix();
    const randomNumber = Math.floor(Math.random() * (rangeTo - rangeFrom) + rangeFrom);

    const d = dayjs.unix(randomNumber);

    console.log(msg.chat.username, 'next', d.toISOString());

    setDuckOut(msg, false);
    await RunningHuntsRepository.setNextDuck(msg, d.toISOString());

    await scheduleDuckJob(`${msg.chat.id}`, d.toDate());
};

/**
 *
 * @param {string} chatId
 * @param {Date} date
 */
export const scheduleDuckJob = async (chatId, date) => {
    State.jobschedules[chatId] = Schedule.scheduleJob(date, async () => {
        console.log('running', chatId);
        if (State.chatHasHunt[chatId]) {
            State.duckTimerStorage[chatId] = dayjs().toISOString();
            await BOT.sendMessage(chatId, '・゜゜・。🦆QUACK!・゜゜・。');
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

        const newVal = await incrementTypeDal(msg, actionType);
        console.log(newVal);
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
        await incrementTypeDal(msg, 'REJECT');
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
        if (isManualStart) {
            await BOT.sendMessage(msg.chat.id, START_HUNT);
        }
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
        await RunningHuntsRepository.deleteGroup(msg);
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
