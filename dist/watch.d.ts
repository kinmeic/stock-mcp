import { WatchItem, Market } from './types.js';
export declare function addWatch(code: string, name: string, reason: string, market: Market): WatchItem;
export declare function updateWatch(code: string, market: Market, updates: Partial<Pick<WatchItem, 'name' | 'reason'>>): WatchItem | null;
export declare function removeWatch(code: string, market: Market): boolean;
export declare function getAllWatch(): WatchItem[];
export declare function getWatch(code: string, market: Market): WatchItem | null;
