import fs from 'fs';
import path from 'path';
const DATA_FILE = path.join(process.cwd(), 'positions.json');
// 加载持仓数据
function loadPositions() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Failed to load positions:', error);
    }
    return [];
}
// 保存持仓数据
function savePositions(positions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(positions, null, 2));
}
// 添加持仓
export function addPosition(code, name, quantity, costPrice, currency, market) {
    const positions = loadPositions();
    const now = new Date().toISOString();
    const newPosition = {
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
export function updatePosition(code, market, updates) {
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
export function removePosition(code, market) {
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
export function getAllPositions() {
    return loadPositions();
}
// 获取单个持仓
export function getPosition(code, market) {
    const positions = loadPositions();
    return positions.find(p => p.code === code && p.market === market) || null;
}
export function getPositionsWithMarket() {
    const positions = loadPositions();
    return positions;
}
