import dotenv from 'dotenv';

import { App } from './app';



dotenv.config();

// Stat express server.
export const app = new App(
    parseInt(process.env.APP_PORT as string),
    process.env.BASE_API_URL as string,
    process.env.DATA_API_BASE_URL as string,
    process.env.DATA_WEBSOCKET_BASE_URL as string
);
app.start();