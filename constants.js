import dotenv from 'dotenv';
dotenv.config();
export const FAIL_RATE = parseFloat(process.env.FAIL_RATE || '0');
export const FROM_WINDOW = parseInt(process.env.FROM_WINDOW || '0', 10); // in seconds
export const TO_WINDOW = parseInt(process.env.TO_WINDOW || '0', 10); // in secons
export const WEBHOOK_PORT = process.env.WEBHOOK_PORT;
export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const SIGNED_KEY = process.env.SIGNED_KEY;
export const SIGNED_CERT = process.env.SIGNED_CERT;
export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
export const ENVIRONMENT = process.env.ENVIRONMENT;
export const DB_URL = process.env.DB_URL;
export const SERVICE_ACCOUNT = process.env.SERVICE_ACCOUNT;
export const USER_MESSAGE_COOLDOWN = parseInt(process.env.USER_MESSAGE_COOLDOWN || '5', 10);
export const VERSION = process.env.VERSION;
export const OWNER_ID = parseInt(process.env.OWNER_ID || '', 10);
export const FRIYAY = parseInt(process.env.FRIYAY || '1.5', 10); // set to zero if no friyay
