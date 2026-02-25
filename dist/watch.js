import fs from 'fs';
import path from 'path';
const DATA_FILE = path.join(process.cwd(), 'watch.json');
// 加载观察列表
function loadWatchList() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Failed to load watch list:', error);
    }
    return [];
}
// 保存观察列表
function saveWatchList(watchList) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(watchList, null, 2));
}
// 添加观察股票
export function addWatch(code, name, reason, market) {
    const watchList = loadWatchList();
    // 检查是否已存在
    const exists = watchList.some(item => item.code === code && item.market === market);
    if (exists) {
        throw new Error('Stock already in watch list');
    }
    const newItem = {
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
export function updateWatch(code, market, updates) {
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
export function removeWatch(code, market) {
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
export function getAllWatch() {
    return loadWatchList();
}
// 获取单个观察股票
export function getWatch(code, market) {
    const watchList = loadWatchList();
    return watchList.find(item => item.code === code && item.market === market) || null;
}
