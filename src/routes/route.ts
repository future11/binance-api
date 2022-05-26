import { Router } from 'express';

import { BinanceController } from '../app/controllers';



export class Route {
    constructor() {

    }

    getRouter(): Router {
        const router = Router();

        router.get('/symbols', BinanceController.getAllSymbols);
        router.get('/symbols/:symbol', BinanceController.getSymbol);

        return router;
    }
}