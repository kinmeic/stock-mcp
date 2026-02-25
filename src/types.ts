// 股票市场类型
export type Market = 'sh' | 'sz' | 'hk' | 'us';

// 股票代码前缀
export type StockPrefix = 'sh' | 'sz' | 'r_hk' | 's_us';

// A股解析后的数据
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
  turnoverRate: number;    // 38 换手率
  peTtm: number;           // 39 市盈率TTM
  amplitude: number;      // 43 振幅
  totalMarketCap: number; // 44 总市值(亿)
  floatMarketCap: number;  // 45 流通市值(亿)
  volumeRatio: number;     // 49 量比
  avgPrice: number;        // 51 均价
  peDynamic: number;       // 52 市盈率(动)
  peStatic: number;        // 53 市盈率(静)
  floatingShares: number;  // 72 流通股
  totalShares: number;     // 73 总股本
  currency: string;       // 82 货币
  bidAsk?: {
    asks: Array<{ price: number; volume: number }>;
    bids: Array<{ price: number; volume: number }>;
  };
}

// 港股解析后的数据
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

// 美股解析后的数据
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

// 统一返回类型
export type StockData = AStockData | HKStockData | USStockData;

// 持仓信息
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

// 观察股票信息
export interface WatchItem {
  code: string;
  name: string;
  reason: string;
  market: Market;
  createdAt: string;
}

// API返回的原始数据
export interface RawStockResponse {
  key: string;
  data: string;
}

// MCP工具参数
export interface GetStockParams {
  code: string;
  market: Market;
}
