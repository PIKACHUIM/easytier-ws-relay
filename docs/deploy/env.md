# 环境变量

## Cloudflare Workers

在 `wrangler.toml` 的 `[vars]` 部分配置：

```toml
[vars]
WS_PATH = "ws"                    # WebSocket 路径
EASYTIER_DISABLE_RELAY = "0"     # 是否禁用中继模式
EASYTIER_COMPRESS_RPC = "1"      # 是否压缩 RPC 消息
```

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `WS_PATH` | string | `ws` | WebSocket 端点的路径部分 |
| `EASYTIER_DISABLE_RELAY` | string | `0` | 设为 `1` 禁用中继转发功能 |
| `EASYTIER_COMPRESS_RPC` | string | `1` | 设为 `1` 启用 RPC 消息 gzip 压缩 |

### 在 Cloudflare Dashboard 中配置

也可以在 Cloudflare Dashboard 中配置环境变量：

1. 进入 Workers & Pages
2. 选择你的 Worker
3. Settings → Variables
4. 添加变量并重新部署

## EdgeOne Pages

在 EdgeOne Pages 项目 Settings → Environment Variables 中配置：

| 变量 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `WS_PATH` | string | `ws` | WebSocket 路径名 |
| `PORT` | string | `9000` | Go 服务监听端口 |

## 说明

### WS_PATH

修改 `WS_PATH` 可以更改 WebSocket 端点的路径：

```toml
# 默认: /ws
WS_PATH = "ws"

# 自定义: /relay
WS_PATH = "relay"
```

修改后，WebSocket 地址变为 `wss://your-domain/relay`

### EASYTIER_DISABLE_RELAY

设为 `1` 后，中继将拒绝转发数据包，仅作信令服务：

```toml
EASYTIER_DISABLE_RELAY = "1"
```

### EASYTIER_COMPRESS_RPC

设为 `0` 可禁用 RPC 消息的 gzip 压缩：

```toml
EASYTIER_COMPRESS_RPC = "0"
```
