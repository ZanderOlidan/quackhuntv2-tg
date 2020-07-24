// eslint-disable-next-line no-unused-vars
import * as TgApi from 'node-telegram-bot-api';
import { DB } from './config.js';

const currentCollection = () => DB.collection('groups');

const getGroups = async () => {
    return currentCollection().get();
};

export const GroupDal = {
    getGroups
};
