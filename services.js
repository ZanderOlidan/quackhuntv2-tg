import * as TgApi from 'node-telegram-bot-api';
import Schedule from 'node-schedule';
import { FAIL_RATE, TO_WINDOW, FROM_WINDOW } from './constants.js';
import { NO_HUNT_IN_GAME, BANG_SUCCESS, BANG_NONEXISTENT, BANG_FAIL_MESSAGES, BEF_SUCCESS, BEF_NONEXISTENT, BEF_FAIL_MESSAGES, BANG, BEF } from './textmentions.js';
import dayjs from 'dayjs';
import Tgfancy from 'tgfancy';
import { kill, incrementTypeDal } from './dal/increment.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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
    const name = msg.from.first_name || msg.from.username;
    const content = `(<a href="tg://user?id=${msg.from.id}">${name}</a>) ${messageContent}`;

    await BOT.sendMessage(msg.chat.id, content, { parse_mode: 'HTML' });
};

export const scheduleNextDuck = async (msg) => {
    const rangeFrom = dayjs().add(FROM_WINDOW, 's').unix();
    const rangeTo = dayjs().add(TO_WINDOW, 's').unix();
    const randomNumber = Math.floor(Math.random() * (rangeTo - rangeFrom) + rangeFrom);
    const d = dayjs.unix(randomNumber).toDate();
    console.log('next', d);
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
    return rand > FAIL_RATE;
};

/**
 *
 * @param {TgApi.Message} msg
 * @param {"BANG" | "BEF" | "REJECT"} actionType
 */
export const doAction = async (msg, actionType) => {
    const MESSAGES = {
        BANG: {
            SUCCESS: BANG_SUCCESS,
            NONEXISTENT: BANG_NONEXISTENT,
            FAIL_MESSAGE: () => generateFailMessage(BANG_FAIL_MESSAGES),
        },
        BEF: {
            SUCCESS: BEF_SUCCESS,
            NONEXISTENT: BEF_NONEXISTENT,
            FAIL_MESSAGE: () => generateFailMessage(BEF_FAIL_MESSAGES),
        }
    };
    if (!hasHunt) {
        return sendMsg(msg, NO_HUNT_IN_GAME);
    }

    if (!isDuckOut(msg)) {
        return sendMsg(msg, MESSAGES[actionType].NONEXISTENT);
    }

    if (isSuccessAction()) {
        scheduleNextDuck(msg);
        const difference = dayjs().diff(duckTimerStorage[msg.chat.id], 's', true);

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
        return sendMsg(msg, `${MESSAGES[actionType].SUCCESS} ${difference} seconds. You have ${term[actionType].term} ${newVal[term[actionType].dbField]} ducks.`);
    } else {
        await incrementTypeDal(msg, 'REJECT');
        return sendMsg(msg, `${MESSAGES[actionType].FAIL_MESSAGE()} Try again.`);
    }
};

// @ts-ignore
export const __dirname = dirname(fileURLToPath(import.meta.url));
