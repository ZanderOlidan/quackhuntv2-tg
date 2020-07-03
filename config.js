import dotenv from 'dotenv';
dotenv.config();
export const FAIL_RATE = 0.2;
export const FROM_WINDOW = 10 * 60; // in seconds
export const TO_WINDOW = 25 * 60; // in secons
export const WEBHOOK_PORT = process.env.WEBHOOK_PORT;
export const WEBHOOK_URL = process.env.WEBHOOK_URL;
export const SIGNED_KEY = process.env.SIGNED_KEY;
export const SIGNED_CERT = process.env.SIGNED_CERT;
export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
export const ENVIRONMENT = process.env.ENVIRONMENT;
