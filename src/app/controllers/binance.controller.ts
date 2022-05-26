import { Request, Response } from 'express';

import { BinanceService } from '../services';



export class BinanceController {
    static getAllSymbols = (
        req: Request,
        res: Response
    ) => {
        const binanceService = new BinanceService();

        try {
            res.status(200).json(binanceService.getAllSymbols());
        } catch (err: any) {
            res.status(500).send({
                status: 500,
                message: err.message || "Error occurred while performing the operation."
            });
        }
    };

    static getSymbol = (
        req: Request,
        res: Response
    ) => {
        const binanceService = new BinanceService();

        try {
            res.status(200).json(binanceService.getSymbol(req.params.symbol));
        } catch (err: any) {
            res.status(500).send({
                status: 500,
                message: err.message || "Error occurred while performing the operation."
            });
        }
    };
}