import * as express from 'express';



declare global {
    namespace Express {
        export interface Request {
            dataApiBaseUrl: string;
            dataWebsocketBaseUrl: string;
        }
    }
}