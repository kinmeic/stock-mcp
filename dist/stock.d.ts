import { StockData, Market } from './types.js';
export declare function fetchStock(code: string, market: Market): Promise<StockData>;
export declare function fetchStocks(codes: Array<{
    code: string;
    market: Market;
}>): Promise<StockData[]>;
