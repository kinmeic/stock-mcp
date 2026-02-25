import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { fetchStock, fetchStocks } from './stock.js';
import * as position from './position.js';
import * as watch from './watch.js';
import { StockData, Market } from './types.js';

// 参数校验schema
const GetStockSchema = z.object({
  code: z.string().describe('股票代码，如 000858'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场: sh=上海, sz=深圳, hk=港股, us=美股'),
});

const GetStocksSchema = z.object({
  stocks: z.array(z.object({
    code: z.string(),
    market: z.enum(['sh', 'sz', 'hk', 'us']),
  })).min(1).describe('股票列表'),
});

const AddPositionSchema = z.object({
  code: z.string().describe('股票代码'),
  name: z.string().describe('股票名称'),
  quantity: z.number().positive().describe('持有数量'),
  costPrice: z.number().positive().describe('成本价'),
  currency: z.string().describe('货币单位，如 CNY、HKD、USD'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

const UpdatePositionSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
  quantity: z.number().positive().optional().describe('持有数量'),
  costPrice: z.number().positive().optional().describe('成本价'),
});

const RemovePositionSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

const GetPositionSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

// 观察列表 schema
const AddWatchSchema = z.object({
  code: z.string().describe('股票代码'),
  name: z.string().describe('股票名称'),
  reason: z.string().describe('观察理由或目标'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

const UpdateWatchSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
  name: z.string().optional().describe('股票名称'),
  reason: z.string().optional().describe('观察理由或目标'),
});

const RemoveWatchSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

const GetWatchSchema = z.object({
  code: z.string().describe('股票代码'),
  market: z.enum(['sh', 'sz', 'hk', 'us']).describe('市场'),
});

class StockServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'stock-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'stock_get',
            description: '获取单只股票实时行情数据',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: '股票代码，如 000858',
                },
                market: {
                  type: 'string',
                  enum: ['sh', 'sz', 'hk', 'us'],
                  description: '市场: sh=上海, sz=深圳, hk=港股, us=美股',
                },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'stock_get_batch',
            description: '批量获取多只股票实时行情数据',
            inputSchema: {
              type: 'object',
              properties: {
                stocks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      code: { type: 'string' },
                      market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'] },
                    },
                    required: ['code', 'market'],
                  },
                  description: '股票列表',
                },
              },
              required: ['stocks'],
            },
          },
          {
            name: 'position_add',
            description: '添加持仓记录',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                name: { type: 'string', description: '股票名称' },
                quantity: { type: 'number', description: '持有数量' },
                costPrice: { type: 'number', description: '成本价' },
                currency: { type: 'string', description: '货币单位，如 CNY、HKD、USD' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'name', 'quantity', 'costPrice', 'currency', 'market'],
            },
          },
          {
            name: 'position_update',
            description: '更新持仓记录（数量或成本价）',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
                quantity: { type: 'number', description: '持有数量' },
                costPrice: { type: 'number', description: '成本价' },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'position_remove',
            description: '删除持仓记录',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'position_list',
            description: '获取所有持仓记录',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'position_get',
            description: '获取单个持仓记录',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'watch_add',
            description: '添加观察股票',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                name: { type: 'string', description: '股票名称' },
                reason: { type: 'string', description: '观察理由或目标' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'name', 'reason', 'market'],
            },
          },
          {
            name: 'watch_update',
            description: '更新观察股票（名称或观察理由）',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
                name: { type: 'string', description: '股票名称' },
                reason: { type: 'string', description: '观察理由或目标' },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'watch_remove',
            description: '删除观察股票',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'market'],
            },
          },
          {
            name: 'watch_list',
            description: '获取所有观察股票',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'watch_get',
            description: '获取单个观察股票',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: '股票代码' },
                market: { type: 'string', enum: ['sh', 'sz', 'hk', 'us'], description: '市场' },
              },
              required: ['code', 'market'],
            },
          },
        ],
      };
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'stock_get') {
          const params = GetStockSchema.parse(args);
          const data = await fetchStock(params.code, params.market as Market);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        if (name === 'stock_get_batch') {
          const params = GetStocksSchema.parse(args);
          const stocks = params.stocks.map(s => ({
            code: s.code,
            market: s.market as Market
          }));
          const data = await fetchStocks(stocks);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        // 持仓管理
        if (name === 'position_add') {
          const params = AddPositionSchema.parse(args);
          const result = position.addPosition(
            params.code,
            params.name,
            params.quantity,
            params.costPrice,
            params.currency,
            params.market as Market
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'position_update') {
          const params = UpdatePositionSchema.parse(args);
          const result = position.updatePosition(
            params.code,
            params.market as Market,
            {
              quantity: params.quantity,
              costPrice: params.costPrice,
            }
          );
          if (!result) {
            throw new Error('Position not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'position_remove') {
          const params = RemovePositionSchema.parse(args);
          const success = position.removePosition(params.code, params.market as Market);
          if (!success) {
            throw new Error('Position not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true }, null, 2),
              },
            ],
          };
        }

        if (name === 'position_list') {
          const result = position.getAllPositions();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'position_get') {
          const params = GetPositionSchema.parse(args);
          const result = position.getPosition(params.code, params.market as Market);
          if (!result) {
            throw new Error('Position not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        // 观察列表管理
        if (name === 'watch_add') {
          const params = AddWatchSchema.parse(args);
          const result = watch.addWatch(
            params.code,
            params.name,
            params.reason,
            params.market as Market
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'watch_update') {
          const params = UpdateWatchSchema.parse(args);
          const result = watch.updateWatch(
            params.code,
            params.market as Market,
            {
              name: params.name,
              reason: params.reason,
            }
          );
          if (!result) {
            throw new Error('Watch item not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'watch_remove') {
          const params = RemoveWatchSchema.parse(args);
          const success = watch.removeWatch(params.code, params.market as Market);
          if (!success) {
            throw new Error('Watch item not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true }, null, 2),
              },
            ],
          };
        }

        if (name === 'watch_list') {
          const result = watch.getAllWatch();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        if (name === 'watch_get') {
          const params = GetWatchSchema.parse(args);
          const result = watch.getWatch(params.code, params.market as Market);
          if (!result) {
            throw new Error('Watch item not found');
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        throw new Error(`Unknown tool: ${name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Stock MCP Server running on stdio');
  }
}

const server = new StockServer();
server.run().catch(console.error);
