import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
    getCommonMiddleware,
    getErrorHandlingMiddleware
} from './routes/middlewares';
import { Route } from './routes';
import { BinanceService } from './app/services';



export class App {
    private port: number;
    private baseApiUrl: string;
    private dataApiBaseUrl: string;
    private dataWebsocketBaseUrl: string;

    private app;
    private server: http.Server | null;


    constructor(port: number, baseApiUrl: string, dataApiBaseUrl: string, dataWebsocketBaseUrl: string) {
        this.port = port;
        this.baseApiUrl = baseApiUrl;
        this.dataApiBaseUrl = dataApiBaseUrl;
        this.dataWebsocketBaseUrl = dataWebsocketBaseUrl;

        this.app = express();
        this.server = null;
    }

    start() {
        // Start Binance fetching service.
        BinanceService.startFetchService(this.dataApiBaseUrl, this.dataWebsocketBaseUrl);


        // Configure the express server.
        this.app.use(bodyParser.json({ limit: "100kb" }));
        this.app.use(bodyParser.urlencoded({ extended: false, limit: "100kb" }));

        this.app.use(cors({ origin: '*' }));

        this.app.use(getCommonMiddleware(this.dataApiBaseUrl, this.dataWebsocketBaseUrl));

        this.app.use(this.baseApiUrl + '/', new Route().getRouter());

        this.app.use(getErrorHandlingMiddleware());

        // Start the express server.
        this.server = this.app.listen(this.port, () => {
            console.log(`The server is listening on ${this.port}...`);
        });
    }

    stop() {
        BinanceService.stopFetchService();

        if (this.server)
            this.server.close();
    }

    getExpressApp() {
        return this.app;
    }
}