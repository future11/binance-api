export interface BinanceApiExchangeInfoModel {
    symbols: BinanceApiExchangeInfoSymbolModel[];
}

export interface BinanceApiExchangeInfoSymbolModel {
    symbol: string;
}

export interface BinanceApiTradeStreamModel {
    stream: string;
    data: BinanceApiTradeStreamDataModel;
}

export interface BinanceApiTradeStreamDataModel {
    s: string;
    p: string;
}

export interface BinanceTradeDataModel {
    symbol: string;
    dataCount: number;
    medianPrice: string;
    lastPrice: string;
}