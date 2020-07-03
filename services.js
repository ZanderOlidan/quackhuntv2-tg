import * as TgApi from 'node-telegram-bot-api';
import Schedule from 'node-schedule';
import { FAIL_RATE, TO_WINDOW, FROM_WINDOW } from './config.js';
import { MESSAGES, NO_HUNT_IN_GAME } from './textmentions.js';
import dayjs from 'dayjs';
import Tgfancy from 'tgfancy';

/**
 * @type {Tgfancy}
 */
let BOT;
export let hasHunt = false;

/**
 * @param {Tgfancy} b
 */
export const setBot = (b) => {
    BOT = b;
};

const duckTimerStorage = {};
const chatHasDuckOut = {};

/**
 *
 * @param {TgApi.Message} msg
 * @param {boolean} isOut
 */
export const setDuckOut = (msg, isOut) => {
    chatHasDuckOut[msg.chat.id] = isOut;
};

/**
 *
 * @param {TgApi.Message} msg
 */
export const isDuckOut = (msg) => {
    return !!chatHasDuckOut[msg.chat.id];
};

export const setHasHunt = isHunting => {
    hasHunt = isHunting;
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {string} messageContent
 */
export const sendMsg = async (msg, messageContent) => {
    console.log(msg.from);
    const name = msg.from.first_name || msg.from.username;
    const content = `(<a href="tg://user?id=${msg.from.id}">${name}</a>) ${messageContent}`;

    await BOT.sendMessage(msg.chat.id, content, { parse_mode: 'HTML' });
};

export const scheduleNextDuck = async (msg) => {
    const rangeFrom = dayjs().add(FROM_WINDOW, 's').unix();
    const rangeTo = dayjs().add(TO_WINDOW, 's').unix();
    const randomNumber = Math.floor(Math.random() * (rangeTo - rangeFrom) + rangeFrom);
    const d = dayjs.unix(randomNumber).toDate();
    setDuckOut(msg, false);
    Schedule.scheduleJob(d, async () => {
        if (hasHunt) {
            duckTimerStorage[msg.chat.id] = dayjs().toISOString();
            await BOT.sendMessage(msg.chat.id, '・゜゜・。🦆QUACK!・゜゜・。');
            setDuckOut(msg, true);
        }
    });
};

/**
 *
 * @param {string[]} list
 */
export const generateFailMessage = (list) => {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
};

const isSuccessAction = () => {
    const rand = Math.random();
    console.log(rand, rand > FAIL_RATE);
    return rand > FAIL_RATE;
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {string} actionType
 */
export const doAction = async (msg, actionType) => {
    if (!hasHunt) {
        return sendMsg(msg, NO_HUNT_IN_GAME);
    }

    if (!isDuckOut(msg)) {
        return sendMsg(msg, MESSAGES[actionType].NONEXISTENT);
    }

    if (isSuccessAction()) {
        scheduleNextDuck(msg);
        const difference = dayjs().diff(duckTimerStorage[msg.chat.id], 's', true);
        return sendMsg(msg, `${MESSAGES[actionType].SUCCESS} ${difference} seconds.`);
    } else {
        return sendMsg(msg, `${MESSAGES[actionType].FAIL_MESSAGE()} Try again.`);
    }
};
