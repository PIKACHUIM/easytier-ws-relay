# 架构原理

## 整体架构

```
┌──────────────┐     WebSocket      ┌──────────────────┐     WebSocket      ┌──────────────┐
│  EasyTier A  │ ──────────────────▶│                  │◀────────────────── │  EasyTier B  │
│  (NAT 后)    │                    │  Cloudflare      │                    │  (NAT 后)    │
│  PeerID: 101 │                    │  Worker          │                    │  PeerID: 102 │
└──────────────┘                    │                  │                    └──────────────┘
                                    │  ┌────────────┐  │
                                    │  │ Durable     │  │
                                    │  │ Object      │  │
                                    │  │ (RelayRoom) │  │
                                    │  │             │  │
                                    │  │ PeerManager │  │
                                    │  │ RpcHandler  │  │
                                    │  └────────────┘  │
                                    └──────────────────┘
```

## 核心模块

### 1. Worker 入口 (`src/worker.js`)

- 处理 HTTP 请求路由
- 非 WebSocket 请求返回 Landing Page
- WebSocket 请求转发到对应的 Durable Object
- 健康检查端点 `/healthz`

### 2. RelayRoom (`src/worker/relay_room.js`)

Cloudflare Durable Object，代表一个「房间」。同一房间内的所有 EasyTier 节点可以互相通信。

**核心逻辑：**
- 解析 EasyTier 16 字节二进制包头
- 根据包类型分发处理（HandShake / Ping / RpcReq / RpcResp / Data）
- WebSocket 关闭时清理 Peer 信息并广播路由更新
- 支持 Durable Object 休眠恢复（序列化/反序列化 WebSocket 元数据）

### 3. PeerManager (`src/worker/core/peer_manager.js`)

核心的 Peer 管理器，维护以下信息：

- 按 `groupKey` 分组的 Peer WebSocket 连接
- 每个 Peer 的元信息（RoutePeerInfo）
- 路由会话状态（routeSessions）
- 连接版本控制（peerConnVersions）

**关键方法：**
- `pushRouteUpdateTo()` — 向指定 Peer 推送路由更新
- `broadcastRouteUpdate()` — 广播路由更新给所有 Peer

### 4. RpcHandler (`src/worker/core/rpc_handler.js`)

处理两类 RPC 服务：

| 服务 | methodIndex | 功能 |
|------|-------------|------|
| PeerCenterRpc | 0/1 | ReportPeers（上报直连信息）、GetGlobalPeerMap（获取全局拓扑图） |
| OspfRouteRpc | 0/1 | SyncRouteInfo（OSPF 路由同步，增量推送） |

### 5. BasicHandlers (`src/worker/core/basic_handlers.js`)

- `handleHandshake` — 验证 magic、网络名、密钥摘要；注册 Peer；延迟推送初始路由更新
- `handlePing` — 回复 Pong 心跳
- `handleForwarding` — 跨 Peer 转发二进制消息（需同 groupKey）

## 分组隔离机制

每个连接通过 `networkName:networkSecret` 组合的 SHA-256 哈希形成 `groupKey`：

```
groupKey = SHA256(networkName + ":" + SHA256(networkSecret))
```

不同网络密钥的节点被隔离在不同分组中，无法互相发现或通信。

## 路由同步流程

1. Peer A 连接并完成握手
2. RelayRoom 注册 Peer A 信息，分配 groupKey
3. RelayRoom 向房间内其他 Peer (同 groupKey) 广播路由更新
4. Peer B 收到路由更新，包含 Peer A 的连接信息（外网 IP/端口、连接位图等）
5. Peer B 尝试与 Peer A 建立直连（P2P 打洞）

## Cloudflare Durable Objects

使用 Durable Objects 的关键优势：

- **持久化状态** — 支持 SQLite 存储，跨请求的 WebSocket 休眠恢复
- **全局唯一** — 同一房间 ID 的 DO 实例全局唯一
- **强一致性** — 对同一 DO 的操作是串行的
- **自动扩展** — Cloudflare 自动管理实例生命周期

## Go 版本（EdgeOne）

`cloud-functions/` 下的 Go 版本实现了相同的协议，使用：

- **Gin** Web 框架处理 HTTP/WebSocket
- **gorilla/websocket** 处理 WebSocket 连接
- **crypto/aes** + **crypto/cipher** 处理加密
- 内存 Map 管理 Room 和 Peer 状态
