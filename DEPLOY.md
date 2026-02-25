# Stock MCP Server 部署指南

## 项目结构

```
stock-mcp/
├── dist/              # 编译后的JS代码
├── src/               # 源代码
│   ├── index.ts       # MCP服务器入口
│   ├── stock.ts       # 股票数据获取
│   ├── position.ts    # 持仓管理
│   ├── watch.ts       # 观察列表管理
│   └── types.ts       # 类型定义
├── node_modules/      # 依赖
├── package.json
├── positions.json      # 持仓数据文件
└── watch.json         # 观察列表数据文件
```

## 部署步骤

### 1. 安装依赖

```bash
cd /path/to/stock-mcp
npm install
```

### 2. 构建项目

```bash
npm run build
```

### 3. 添加到 MCP 配置

在项目根目录创建 `.claude/mcp.json` 文件：

```json
{
  "mcpServers": {
    "stock": {
      "command": "node",
      "args": [
        "/path/to/stock-mcp/dist/index.js"
      ],
      "env": {}
    }
  }
}
```

**注意**：路径需要使用绝对路径。

### 4. 重启 Claude Code

配置完成后，重启 Claude Code 使配置生效。

---

## 可用工具

### 股票行情

| 工具 | 说明 | 参数 |
|-----|------|------|
| `stock_get` | 获取单只股票实时行情 | code, market |
| `stock_get_batch` | 批量获取股票行情 | stocks[] |

### 持仓管理

| 工具 | 说明 | 参数 |
|-----|------|------|
| `position_add` | 添加持仓 | code, name, quantity, costPrice, currency, market |
| `position_update` | 更新持仓 | code, market, quantity?, costPrice? |
| `position_remove` | 删除持仓 | code, market |
| `position_list` | 获取所有持仓 | - |
| `position_get` | 获取单个持仓 | code, market |

### 观察列表

| 工具 | 说明 | 参数 |
|-----|------|------|
| `watch_add` | 添加观察股票 | code, name, reason, market |
| `watch_update` | 更新观察股票 | code, market, name?, reason? |
| `watch_remove` | 删除观察股票 | code, market |
| `watch_list` | 获取所有观察 | - |
| `watch_get` | 获取单个观察 | code, market |

---

## 参数说明

- **market** (市场): `sh`=上海, `sz`=深圳, `hk`=港股, `us`=美股
- **currency** (货币): `CNY`=人民币, `HKD`=港币, `USD`=美元

---

## 使用示例

```javascript
// 获取股票行情
{ code: "000858", market: "sz" }

// 批量获取
{ stocks: [
  { code: "000858", market: "sz" },
  { code: "600000", market: "sh" },
  { code: "00700", market: "hk" },
  { code: "AAPL", market: "us" }
]}

// 添加持仓
{ code: "000858", name: "五粮液", quantity: 100, costPrice: 105.5, currency: "CNY", market: "sz" }

// 添加观察
{ code: "600000", name: "浦发银行", reason: "银行股低估，等待估值修复", market: "sh" }
```
