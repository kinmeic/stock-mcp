# Stock MCP Server

腾讯股票数据 MCP 服务器，为 AI 助手提供股票数据查询和持仓管理功能。

## 功能特性

### 股票行情查询
- A股实时行情（上海、深圳）
- 港股实时行情
- 美股实时行情
- 支持批量查询

### 持仓管理
- 添加、更新、删除持仓
- 查询持仓列表和详情

### 观察列表
- 添加、更新、删除关注股票
- 查询观察列表

## 支持的市场

| 代码 | 市场 |
|------|------|
| sh | 上海A股 |
| sz | 深圳A股 |
| hk | 港股 |
| us | 美股 |

## 快速开始

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 配置 MCP

在 Claude Code 或其他 MCP 客户端的配置文件中添加：

```json
{
  "mcpServers": {
    "stock": {
      "command": "node",
      "args": ["/path/to/stock-mcp/dist/index.js"]
    }
  }
}
```

### 使用示例

```typescript
// 查询股票行情
stock_get({ symbol: "sh000001" })

// 批量查询
stock_get_batch({ symbols: ["sh000001", "sz000001"] })

// 添加持仓
position_add({ symbol: "sz000001", shares: 100, cost: 10.5 })

// 添加观察
watch_add({ symbol: "hk00700", note: "腾讯控股" })
```

## 可用工具

| 工具 | 描述 |
|------|------|
| `stock_get` | 获取单只股票实时行情 |
| `stock_get_batch` | 批量获取多只股票行情 |
| `position_add` | 添加持仓 |
| `position_update` | 更新持仓 |
| `position_remove` | 删除持仓 |
| `position_list` | 获取所有持仓 |
| `position_get` | 获取单个持仓 |
| `watch_add` | 添加观察股票 |
| `watch_update` | 更新观察股票 |
| `watch_remove` | 删除观察股票 |
| `watch_list` | 获取所有观察 |
| `watch_get` | 获取单个观察 |

## 技术栈

- TypeScript
- Node.js
- @modelcontextprotocol/sdk

## 数据来源

股票数据来自 [腾讯财经 API](https://qt.gtimg.cn)

## License

MIT
