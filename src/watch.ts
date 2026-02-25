import { WatchItem, Market } from './types.js';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'watch.json');

// 加载观察列表
function loadWatchList(): WatchItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load watch list:', error);
  }
  return [];
}

// 保存观察列表
function saveWatchList(watchList: WatchItem[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(watchList, null, 2));
}

// 添加观察股票
export function addWatch(
  code: string,
  name: string,
  reason: string,
  market: Market
): WatchItem {
  const watchList = loadWatchList();

  // 检查是否已存在
  const exists = watchList.some(item => item.code === code && item.market === market);
  if (exists) {
    throw new Error('Stock already in watch list');
  }

  const newItem: WatchItem = {
    code,
    name,
    reason,
    market,
    createdAt: new Date().toISOString(),
  };

  watchList.push(newItem);
  saveWatchList(watchList);

  return newItem;
}

// 更新观察股票
export function updateWatch(
  code: string,
  market: Market,
  updates: Partial<Pick<WatchItem, 'name' | 'reason'>>
): WatchItem | null {
  const watchList = loadWatchList();
  const index = watchList.findIndex(item => item.code === code && item.market === market);

  if (index === -1) {
    return null;
  }

  watchList[index] = {
    ...watchList[index],
    ...updates,
  };

  saveWatchList(watchList);
  return watchList[index];
}

// 删除观察股票
export function removeWatch(code: string, market: Market): boolean {
  const watchList = loadWatchList();
  const index = watchList.findIndex(item => item.code === code && item.market === market);

  if (index === -1) {
    return false;
  }

  watchList.splice(index, 1);
  saveWatchList(watchList);
  return true;
}

// 获取所有观察股票
export function getAllWatch(): WatchItem[] {
  return loadWatchList();
}

// 获取单个观察股票
export function getWatch(code: string, market: Market): WatchItem | null {
  const watchList = loadWatchList();
  return watchList.find(item => item.code === code && item.market === market) || null;
}
