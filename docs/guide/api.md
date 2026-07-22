# API 参考

## WebSocket 端点

### 连接地址

```
wss://<your-domain>/ws?room=<room_id>
```

### 连接参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `room` | string | 否 | 房间 ID，默认 `"default"`。同一房间内的节点可互相发现 |

### 子协议

连接使用 WebSocket 二进制消息，协议为 EasyTier Binary Protocol。详见[协议说明](/guide/protocol)。

## HTTP 端点

### 健康检查

```
GET /healthz
```

**响应：**
```
200 OK
ok
```

### 主页 (Landing Page)

```
GET /
```

**响应：**
- `200 OK` — 返回精美的 HTML 主页，包含中继地址、使用指南等信息
- 支持暗色/亮色主题切换
- 支持中英文语言切换

### WebSocket 端点 (浏览器访问)

```
GET /ws
```

当通过浏览器直接访问 WebSocket 端点（不带 `Upgrade: websocket` 头）时，返回主页 HTML。

## 服务器常量

| 常量 | 值 | 说明 |
|------|-----|------|
| MY_PEER_ID | 10000001 | 服务器 Peer ID |
| MAGIC | 0xd1e1a5e1 | 协议魔数 |
| VERSION | 1 | 协议版本 |
| HEADER_SIZE | 16 | 二进制包头大小 (字节) |

## 环境变量

### Cloudflare Workers

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `WS_PATH` | `ws` | WebSocket 路径 |
| `EASYTIER_DISABLE_RELAY` | `0` | 是否禁用 Relay 模式 |
| `EASYTIER_COMPRESS_RPC` | `1` | 是否压缩 RPC 消息 |

### EdgeOne Pages

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `WS_PATH` | `ws` | WebSocket 路径 |
| `PORT` | `9000` | Go 服务监听端口 |

## 示例：EasyTier 客户端配置

### 命令行

```bash
easytier-core \
  --relay "wss://your-relay.workers.dev/ws?room=my-network" \
  --network-name my-network \
  --network-secret my-secret-key
```

### 配置文件 (config.toml)

```toml
[relay]
url = "wss://your-relay.workers.dev/ws?room=my-network"

[network]
name = "my-network"
secret = "my-secret-key"
```

### 多中继 (主备)

```toml
[[relay]]
url = "wss://relay1.workers.dev/ws?room=my-network"

[[relay]]
url = "wss://relay2.workers.dev/ws?room=my-network"
```
