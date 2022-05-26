import { Request, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';



export type CommonMiddleware = (
    req: Request<ParamsDictionary, any, any, Query, Record<string, any>>,
    res: Response<any>,
    next: (arg?: any) => any
) => void;

export const getCommonMiddleware = (
    dataApiBaseUrl: string,
    dataWebsocketBaseUrl: string
) => (
    req: Request<ParamsDictionary, any, any, Query, Record<string, any>>,
    res: Response<any>,
    next: (arg?: any) => any
) => {
    req.dataApiBaseUrl = dataApiBaseUrl;
    req.dataWebsocketBaseUrl = dataWebsocketBaseUrl;

    next();
};