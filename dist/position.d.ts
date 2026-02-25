import { Position, Market } from './types.js';
export declare function addPosition(code: string, name: string, quantity: number, costPrice: number, currency: string, market: Market): Position;
export declare function updatePosition(code: string, market: Market, updates: Partial<Pick<Position, 'quantity' | 'costPrice'>>): Position | null;
export declare function removePosition(code: string, market: Market): boolean;
export declare function getAllPositions(): Position[];
export declare function getPosition(code: string, market: Market): Position | null;
export interface PositionWithMarket extends Position {
    currentPrice?: number;
    marketValue?: number;
    profit?: number;
    profitPercent?: number;
}
export declare function getPositionsWithMarket(): PositionWithMarket[];
