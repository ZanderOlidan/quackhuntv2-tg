import admin from 'firebase-admin';
import { DB_URL, SERVICE_ACCOUNT } from '../constants.js';
import { readFile } from 'fs';
import { __dirname } from '../services.js';

/**
 * @type {FirebaseFirestore.Firestore}
 */
let DB;
let INCREMENT_ONE;
export const init = () => {
    readFile(`${__dirname}/${SERVICE_ACCOUNT}`, 'utf-8', (err, data) => {
        if (err) throw err;

        const contents = JSON.parse(data);
        admin.initializeApp({
            credential: admin.credential.cert(contents),
            databaseURL: DB_URL
        });

        DB = admin.firestore();
        INCREMENT_ONE = admin.firestore.FieldValue.increment(1);
    });
};

export {
    DB,
    INCREMENT_ONE
};
