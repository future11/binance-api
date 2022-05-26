import fetch from 'node-fetch';
import _ from 'lodash';
import WebSocket from 'ws';

import { BinanceApiExchangeInfoModel, BinanceApiTradeStreamModel, BinanceTradeDataModel } from '../models';
import { CommonService } from './common.service';



/**
 * Service class for REST API call and fetching data from Binance.
 */
export class BinanceService {
    private static tradeStreamCountPerWebSocket: number = 50;
    private static tradeStreams: WebSocket[] = [];
    private static fetchServiceTimer: NodeJS.Timer | null = null;
    private static symbols: string[] = [];
    private static tradeData: any = {};



    // Default constructor.
    constructor() {
        
    }

    /**
     * Start the fetch service.
     * @param dataApiBaseUrl: Binance base api url for REST API call.
     * @param dataWebsocketBaseUrl: Binance base WebSocket url for streams.
     */
    static async startFetchService(dataApiBaseUrl: string, dataWebsocketBaseUrl: string) {
        // For running the fetch service immediately when calling this function.
        await BinanceService.fetchAllSymbols(dataApiBaseUrl, dataWebsocketBaseUrl);

        // It would call /exchangeInfo api at every 10 mins because symbols list changes from time to time.
        if (BinanceService.fetchServiceTimer)
            clearInterval(BinanceService.fetchServiceTimer);

        BinanceService.fetchServiceTimer = setInterval(
            BinanceService.fetchAllSymbols,
            10 * 60 * 1000,
            dataApiBaseUrl,
            dataWebsocketBaseUrl
        );
    }

    /**
     * Stop the fetch service.
     */
    static stopFetchService() {
        if (BinanceService.fetchServiceTimer)
            clearInterval(BinanceService.fetchServiceTimer);

        for (let i = 0; i < BinanceService.tradeStreams.length - 1; i ++) {
            BinanceService.tradeStreams[i].close();
        }

        BinanceService.tradeStreams = [];
    }

    /**
     * Fetch all symbols and listen to trade streams for them.
     * @param dataApiBaseUrl: Binance base api url for REST API call.
     * @param dataWebsocketBaseUrl: Binance base WebSocket url for streams.
     */
    private static async fetchAllSymbols(dataApiBaseUrl: string, dataWebsocketBaseUrl: string) {
        // Stop listening trade streams.
        BinanceService.stopListeningTradeStreams();

        // Call the Binance API '/exchangeInfo'.
        const allSymbols = await fetch(dataApiBaseUrl + "/exchangeInfo");
        const allSymbolsInJson = (await allSymbols.json()) as BinanceApiExchangeInfoModel;
        
        const symbols = _.map(allSymbolsInJson.symbols, "symbol");

        // Get deleted symbols and delete its data.
        const deletedSymbols = _.difference(BinanceService.symbols, symbols);

        for (let i = 0; i < deletedSymbols.length; i ++) {
            delete BinanceService.tradeData[deletedSymbols[i]];
        }

        // Get new added symbols and initialize its data.
        const addedSymbols = _.difference(symbols, BinanceService.symbols);

        for (let i = 0; i < addedSymbols.length; i ++) {
            BinanceService.tradeData[addedSymbols[i]] = {
                symbol: addedSymbols[i],
                dataCount: 0,
                medianPrice: "",
                lastPrice: "",
                prices: []
            };
        }

        // Check to see if current symbol list is same to previoue one.
        if (deletedSymbols.length > 0 || addedSymbols.length > 0) {
            BinanceService.symbols = symbols;
            BinanceService.listenTradeStreams(dataWebsocketBaseUrl, symbols);
        }
    };

    /**
     * Fetch all symbols and listen to trade streams for them.
     * @param dataWebsocketBaseUrl: Binance base WebSocket url for streams.
     * @param symbols: symbols list.
     */
    private static listenTradeStreams(dataWebsocketBaseUrl: string, symbols: string[]) {
        // Calculate WebSocket count.
        const tradeStreamCount = Math.ceil(symbols.length / BinanceService.tradeStreamCountPerWebSocket);

        // Create 1 Websocket for every 'tradeStreamCountPerWebSocket'.
        for (let i = 0; i < tradeStreamCount; i ++) {
            const streamNames = _.chain(symbols.slice(i * BinanceService.tradeStreamCountPerWebSocket, (i + 1) * BinanceService.tradeStreamCountPerWebSocket))
                .map((symbol) => { return symbol.toLowerCase() + "@trade"; })
                .join("/")
                .value();

            const tradeStream = new WebSocket(dataWebsocketBaseUrl + "/stream?streams=" + streamNames);
            tradeStream.onmessage = (event: WebSocket.MessageEvent) => {
                const tradeStreamData = JSON.parse(event.data as string) as BinanceApiTradeStreamModel;
                const key = tradeStreamData.data.s;

                CommonService.insertElementToSortedArray(BinanceService.tradeData[key].prices, parseFloat(tradeStreamData.data.p));
                
                const dataCount = BinanceService.tradeData[key].dataCount + 1;
                const midIndex = dataCount >>> 1;
                
                BinanceService.tradeData[key].dataCount = dataCount;
                BinanceService.tradeData[key].lastPrice = tradeStreamData.data.p;
                BinanceService.tradeData[key].medianPrice = (
                        (dataCount % 2 == 0)
                            ? (BinanceService.tradeData[key].prices[midIndex - 1] + BinanceService.tradeData[key].prices[midIndex]) / 2
                            : BinanceService.tradeData[key].prices[midIndex]
                    ).toFixed(8);

            };

            BinanceService.tradeStreams.push(tradeStream);
        }
    };

    /**
     * Stop listening trade streams.
     */
    private static stopListeningTradeStreams() {
        for (let i = 0; i < BinanceService.tradeStreams.length - 1; i ++) {
            BinanceService.tradeStreams[i].close();
        }

        BinanceService.tradeStreams = [];
    }

    /**
     * Get all symbols data.
     * @returns all symbols data list.
     */
    getAllSymbols() {
        let result: BinanceTradeDataModel[] = [];

        for (let i = 0; i < BinanceService.symbols.length; i ++) {
            result.push(this.getSymbol(BinanceService.symbols[i]));
        }

        return result;
    }

    /**
     * Get a symbol data.
     * @returns a symbol data.
     */
    getSymbol(symbol: string) {
        return  (_.omit(BinanceService.tradeData[symbol], "prices") || {}) as BinanceTradeDataModel;
    }
}