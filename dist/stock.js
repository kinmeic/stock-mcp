const BASE_URL = 'https://qt.gtimg.cn';
// 根据市场获取前缀
function getPrefix(market) {
    switch (market) {
        case 'sh': return 'sh';
        case 'sz': return 'sz';
        case 'hk': return 'r_hk';
        case 'us': return 's_us';
    }
}
// 获取股票数据
export async function fetchStock(code, market) {
    const prefix = getPrefix(market);
    const url = `${BASE_URL}/?q=${prefix}${code}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
    }
    const text = await response.text();
    const rawData = parseRawResponse(text);
    if (!rawData) {
        throw new Error(`No data returned for ${prefix}${code}`);
    }
    return parseStockData(rawData, market);
}
// 解析原始响应
function parseRawResponse(text) {
    // 格式: v_sh600000="..." 或 v_s_usAAPL="..."
    const match = text.match(/v_(sh|sz|r_hk|s_us)([a-zA-Z0-9._]+)="([^"]+)"/);
    if (!match)
        return null;
    return {
        key: match[1] + match[2],
        data: match[3]
    };
}
// 解析股票数据
function parseStockData(raw, market) {
    // 不过滤空字段，保留原始索引
    const fields = raw.data.split('~');
    if (fields.length < 10) {
        throw new Error(`Invalid stock data: too few fields`);
    }
    const marketCode = parseInt(fields[0]);
    // 判断市场类型
    if (market === 'sh' || market === 'sz' || marketCode === 1 || marketCode === 51) {
        return parseAStock(fields, market === 'sz' ? 'sz' : 'sh');
    }
    else if (market === 'hk' || marketCode === 100) {
        return parseHKStock(fields);
    }
    else if (market === 'us' || marketCode === 200) {
        return parseUSStock(fields);
    }
    throw new Error(`Unknown market type: ${marketCode}`);
}
// 解析A股数据
function parseAStock(fields, market) {
    const getField = (idx) => fields[idx] || '';
    const parseNum = (idx, defaultVal = 0) => {
        const val = getField(idx);
        return val ? parseFloat(val) || defaultVal : defaultVal;
    };
    const result = {
        market,
        name: getField(1),
        code: getField(2),
        currentPrice: parseNum(3),
        yesterdayClose: parseNum(4),
        open: parseNum(5),
        volume: parseNum(6),
        outside: parseNum(7),
        inside: parseNum(8),
        datetime: getField(30),
        change: parseNum(31),
        changePercent: parseNum(32),
        high: parseNum(33),
        low: parseNum(34),
        amount: parseNum(37),
        turnoverRate: parseNum(38),
        peTtm: parseNum(39),
        amplitude: parseNum(43),
        totalMarketCap: parseNum(44),
        floatMarketCap: parseNum(45),
        volumeRatio: parseNum(49),
        avgPrice: parseNum(51),
        peDynamic: parseNum(52),
        peStatic: parseNum(53),
        floatingShares: parseNum(72),
        totalShares: parseNum(73),
        currency: getField(82) || 'CNY',
    };
    // 解析10档买卖盘
    const asks = [];
    const bids = [];
    // 卖盘: 9-10(价格,量), 11-12, 13-14, 15-16, 17-18 (卖5-卖1)
    for (let i = 9; i <= 18; i += 2) {
        if (fields[i] && fields[i + 1]) {
            asks.push({
                price: parseFloat(fields[i]),
                volume: parseInt(fields[i + 1])
            });
        }
    }
    // 买盘: 19-20(价格,量), 21-22, 23-24, 25-26, 27-28 (买1-买5)
    for (let i = 19; i <= 28; i += 2) {
        if (fields[i] && fields[i + 1]) {
            bids.push({
                price: parseFloat(fields[i]),
                volume: parseInt(fields[i + 1])
            });
        }
    }
    result.bidAsk = { asks, bids };
    return result;
}
// 解析港股数据
function parseHKStock(fields) {
    const getField = (idx) => fields[idx] || '';
    const parseNum = (idx, defaultVal = 0) => {
        const val = getField(idx);
        return val ? parseFloat(val) || defaultVal : defaultVal;
    };
    return {
        market: 'hk',
        name: getField(1),
        code: getField(2),
        currentPrice: parseNum(3),
        yesterdayClose: parseNum(4),
        open: parseNum(5),
        volume: parseNum(6),
        datetime: getField(30),
        change: parseNum(31),
        changePercent: parseNum(32),
        high: parseNum(33),
        low: parseNum(34),
        amount: parseNum(37),
        pe: parseNum(39),
        floatingShares: parseNum(69),
        totalShares: parseNum(70),
        currency: getField(75) || 'HKD',
    };
}
// 解析美股数据
function parseUSStock(fields) {
    const getField = (idx) => fields[idx] || '';
    const parseNum = (idx, defaultVal = 0) => {
        const val = getField(idx);
        return val ? parseFloat(val) || defaultVal : defaultVal;
    };
    return {
        market: 'us',
        name: getField(1),
        code: getField(2),
        currentPrice: parseNum(3),
        change: parseNum(4),
        changePercent: parseNum(5),
        volume: parseNum(6),
        amount: parseNum(7),
        marketCap: parseNum(8),
        currency: 'USD',
    };
}
// 获取多只股票数据
export async function fetchStocks(codes) {
    const results = [];
    for (const { code, market } of codes) {
        try {
            const data = await fetchStock(code, market);
            results.push(data);
        }
        catch (error) {
            console.error(`Failed to fetch ${market}${code}:`, error);
        }
    }
    return results;
}
