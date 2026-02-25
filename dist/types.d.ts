export type Market = 'sh' | 'sz' | 'hk' | 'us';
export type StockPrefix = 'sh' | 'sz' | 'r_hk' | 's_us';
export interface AStockData {
    market: 'sh' | 'sz';
    name: string;
    code: string;
    currentPrice: number;
    yesterdayClose: number;
    open: number;
    volume: number;
    outside: number;
    inside: number;
    datetime: string;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    amount: number;
    turnoverRate: number;
    peTtm: number;
    amplitude: number;
    totalMarketCap: number;
    floatMarketCap: number;
    volumeRatio: number;
    avgPrice: number;
    peDynamic: number;
    peStatic: number;
    floatingShares: number;
    totalShares: number;
    currency: string;
    bidAsk?: {
        asks: Array<{
            price: number;
            volume: number;
        }>;
        bids: Array<{
            price: number;
            volume: number;
        }>;
    };
}
export interface HKStockData {
    market: 'hk';
    name: string;
    code: string;
    currentPrice: number;
    yesterdayClose: number;
    open: number;
    volume: number;
    datetime: string;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    amount: number;
    pe: number;
    floatingShares: number;
    totalShares: number;
    currency: string;
}
export interface USStockData {
    market: 'us';
    name: string;
    code: string;
    currentPrice: number;
    change: number;
    changePercent: number;
    volume: number;
    amount: number;
    marketCap?: number;
    currency: string;
}
export type StockData = AStockData | HKStockData | USStockData;
export interface Position {
    code: string;
    name: string;
    quantity: number;
    costPrice: number;
    currency: string;
    market: Market;
    createdAt: string;
    updatedAt: string;
}
export interface WatchItem {
    code: string;
    name: string;
    reason: string;
    market: Market;
    createdAt: string;
}
export interface RawStockResponse {
    key: string;
    data: string;
}
export interface GetStockParams {
    code: string;
    market: Market;
}
