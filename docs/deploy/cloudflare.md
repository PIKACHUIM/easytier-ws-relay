# 部署到 Cloudflare Workers

## 一键部署

点击下方按钮，一键部署到你自己的 Cloudflare 账号：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/EasyTier/easytier-ws-relay)

## 手动部署

### 前置条件

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| [Node.js](https://nodejs.org/) | >= 16 | JavaScript 运行时 |
| [pnpm](https://pnpm.io/) | 最新 | 包管理器 (推荐，也可用 npm) |
| [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) | >= 3.0 | Cloudflare Workers 命令行工具 |
| [Cloudflare 账号](https://dash.cloudflare.com/sign-up) | — | 免费账号即可 |

### 步骤 1：安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 2：克隆项目

```bash
git clone https://github.com/EasyTier/easytier-ws-relay.git
cd easytier-ws-relay
```

### 步骤 3：安装依赖

```bash
pnpm install
# 或
npm install
```

### 步骤 4：登录 Cloudflare

```bash
wrangler login
```

浏览器会自动打开 Cloudflare 登录页面，登录后授权即可。

### 步骤 5：部署

```bash
wrangler deploy
```

### 步骤 6：获取部署地址

部署成功后，终端会显示 Worker 地址，格式为：

```
https://easytier-ws-relay-worker.<your-subdomain>.workers.dev
```

WebSocket 中继地址为：

```
wss://easytier-ws-relay-worker.<your-subdomain>.workers.dev/ws
```

## 配置说明

编辑 `wrangler.toml` 文件可以自定义部署配置：

```toml
name = "easytier-ws-relay-worker"    # Worker 名称（可修改）
main = "src/worker.js"                # 入口文件
compatibility_date = "2024-11-01"
compatibility_flags = ["nodejs_compat"]  # 启用 Node.js 兼容模式

[vars]
WS_PATH = "ws"                        # WebSocket 路径
EASYTIER_DISABLE_RELAY = "0"         # 是否禁用 Relay 模式
EASYTIER_COMPRESS_RPC = "1"          # 是否压缩 RPC 消息

[durable_objects]
bindings = [
  { name = "RELAY_ROOM", class_name = "RelayRoom" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["RelayRoom"]
```

## 本地开发

```bash
# 启动本地开发服务器
pnpm dev

# 或监听所有网络接口
pnpm dev -- --ip 0.0.0.0
```

本地开发时 WebSocket 地址为 `ws://localhost:8787/ws`。

## 更新部署

修改代码后，重新部署即可：

```bash
wrangler deploy
```

Cloudflare 会自动进行零停机部署。

## 删除部署

```bash
wrangler delete
```
