# 本地开发

## 开发环境搭建

### Cloudflare Workers 开发

#### 1. 克隆项目

```bash
git clone https://github.com/EasyTier/easytier-ws-relay.git
cd easytier-ws-relay
```

#### 2. 安装依赖

```bash
pnpm install
```

#### 3. 启动开发服务器

```bash
# 监听所有网络接口
pnpm dev

# 仅本地回环
pnpm start
```

开发服务器默认运行在 `http://localhost:8787`。

#### 4. 生成 Protobuf 代码

如果修改了 `protos/` 下的 `.proto` 文件，需要重新生成 JS 代码：

```bash
npx pbjs -t static-module -w es6 -o src/worker/core/protos_generated.js protos/*.proto
```

### Go Cloud Functions 开发 (EdgeOne)

#### 1. 进入 cloud-functions 目录

```bash
cd cloud-functions
```

#### 2. 安装 Go 依赖

```bash
go mod tidy
```

#### 3. 启动 Go 服务

```bash
go run .
```

服务监听在 `http://localhost:9000`。

#### 4. 测试 WebSocket 连接

使用 [websocat](https://github.com/vi/websocat) 进行测试：

```bash
websocat ws://localhost:9000/ws?room=test
```

## 项目结构

```
easytier-ws-relay/
├── src/
│   ├── worker.js              # Worker 入口 & Landing Page
│   └── worker/
│       ├── relay_room.js       # Durable Object: RelayRoom
│       └── core/
│           ├── basic_handlers.js  # 握手/Ping/转发
│           ├── compress.js        # gzip 压缩工具
│           ├── constants.js       # 常量定义
│           ├── crypto.js          # 加密模块
│           ├── packet.js          # 16字节二进制包头
│           ├── peer_manager.js    # Peer 管理器核心
│           ├── protos.js          # Protobuf 类型加载
│           ├── protos_generated.js # 生成的 Proto JS 代码
│           └── rpc_handler.js     # RPC 请求/响应处理
├── cloud-functions/           # EdgeOne Go Cloud Functions
│   ├── index.go               # Go 版本入口
│   ├── go.mod                 # Go 模块定义
│   └── relay/
│       ├── relay.go            # 中继核心逻辑
│       └── crypto.go           # 加密模块
├── docs/                      # VitePress 文档
├── protos/                    # Protocol Buffers 定义
│   ├── common.proto
│   ├── peer_rpc.proto
│   ├── error.proto
│   └── google/protobuf/
├── wrangler.toml              # Cloudflare 部署配置
├── package.json
└── README.md
```

## 调试技巧

### Cloudflare Workers 调试

使用 `wrangler tail` 查看实时日志：

```bash
wrangler tail
```

在代码中使用 `console.log()` 输出调试信息，日志会显示在终端和控制台。

### Go 服务调试

Go 版本会输出详细的连接日志：

```
2024/01/01 10:00:00 EasyTier WS Relay starting on :9000
2024/01/01 10:00:00 WebSocket endpoint: /ws
2024/01/01 10:00:05 New WebSocket connection in room: test
2024/01/01 10:00:05 Handshake from peer 12345678
```

### 测试工具

推荐使用以下工具测试 WebSocket 连接：

- [websocat](https://github.com/vi/websocat) — 命令行 WebSocket 客户端
- [wscat](https://github.com/websockets/wscat) — Node.js WebSocket 客户端
- Postman — GUI WebSocket 测试工具

## 代码规范

- **JavaScript**: ES Module 语法 (`import`/`export`)
- **Go**: 遵循 [Effective Go](https://go.dev/doc/effective_go)
- **Protobuf**: Protocol Buffers 3 (proto3)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交代码 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
