import { Position, Market } from './types.js';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'positions.json');

// 加载持仓数据
function loadPositions(): Position[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load positions:', error);
  }
  return [];
}

// 保存持仓数据
function savePositions(positions: Position[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(positions, null, 2));
}

// 添加持仓
export function addPosition(
  code: string,
  name: string,
  quantity: number,
  costPrice: number,
  currency: string,
  market: Market
): Position {
  const positions = loadPositions();
  const now = new Date().toISOString();

  const newPosition: Position = {
    code,
    name,
    quantity,
    costPrice,
    currency,
    market,
    createdAt: now,
    updatedAt: now,
  };

  positions.push(newPosition);
  savePositions(positions);

  return newPosition;
}

// 更新持仓
export function updatePosition(
  code: string,
  market: Market,
  updates: Partial<Pick<Position, 'quantity' | 'costPrice'>>
): Position | null {
  const positions = loadPositions();
  const index = positions.findIndex(p => p.code === code && p.market === market);

  if (index === -1) {
    return null;
  }

  positions[index] = {
    ...positions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  savePositions(positions);
  return positions[index];
}

// 删除持仓
export function removePosition(code: string, market: Market): boolean {
  const positions = loadPositions();
  const index = positions.findIndex(p => p.code === code && p.market === market);

  if (index === -1) {
    return false;
  }

  positions.splice(index, 1);
  savePositions(positions);
  return true;
}

// 获取所有持仓
export function getAllPositions(): Position[] {
  return loadPositions();
}

// 获取单个持仓
export function getPosition(code: string, market: Market): Position | null {
  const positions = loadPositions();
  return positions.find(p => p.code === code && p.market === market) || null;
}

// 获取持仓列表（带当前行情）
export interface PositionWithMarket extends Position {
  currentPrice?: number;
  marketValue?: number;
  profit?: number;
  profitPercent?: number;
}

export function getPositionsWithMarket(): PositionWithMarket[] {
  const positions = loadPositions();
  return positions;
}
