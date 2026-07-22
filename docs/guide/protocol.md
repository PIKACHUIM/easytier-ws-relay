# 协议说明

## 二进制包头格式

EasyTier 使用自定义的 16 字节二进制包头：

```
Byte 0-3   Byte 4-7   Byte 8-9  Byte 10  Byte 11   Byte 12-13  Byte 14-15
┌──────────┬──────────┬─────────┬────────┬─────────┬────────────┬──────────┐
│fromPeerId│ toPeerId │pktType  │ flags  │fwdCnt   │  reserved  │   len    │
│  uint32  │  uint32  │ uint16  │ uint8  │ uint8   │  uint16    │  uint16  │
└──────────┴──────────┴─────────┴────────┴─────────┴────────────┴──────────┘
```

## 字段说明

| 字段 | 类型 | 字节 | 说明 |
|------|------|------|------|
| fromPeerId | uint32 | 0-3 | 发送方 Peer ID |
| toPeerId | uint32 | 4-7 | 接收方 Peer ID |
| pktType | uint16 | 8-9 | 包类型 |
| flags | uint8 | 10 | 标志位 |
| fwdCnt | uint8 | 11 | 转发计数器 |
| reserved | uint16 | 12-13 | 保留字段 |
| len | uint16 | 14-15 | 负载长度 |

## 包类型 (PacketType)

| 值 | 名称 | 说明 |
|----|------|------|
| 0 | Invalid | 无效 |
| 1 | Data | 数据包 |
| 2 | HandShake | 握手包 |
| 3 | RoutePacket | 路由包 (已弃用) |
| 4 | Ping | 心跳请求 |
| 5 | Pong | 心跳响应 |
| 6 | TaRpc | TA RPC (已弃用) |
| 7 | Route | 路由 (已弃用) |
| 8 | RpcReq | RPC 请求 |
| 9 | RpcResp | RPC 响应 |
| 10 | ForeignNetworkPacket | 外网数据包 |
| 11 | KcpSrc | KCP 源 |
| 12 | KcpDst | KCP 目标 |

## 握手流程

```
Client (Peer A)                          Relay (PeerID: 10000001)
     │                                           │
     │──── HandShake ───────────────────────────▶│
     │     fromPeerId = A_ID                     │
     │     payload = {magic, version,            │
     │                network_name,              │
     │                network_secret_digest}      │
     │                                           │
     │                      register peer        │
     │                      derive groupKey      │
     │                                           │
     │◀─── HandShake Response ───────────────────│
     │     fromPeerId = 10000001                 │
     │     toPeerId = A_ID                       │
     │                                           │
     │◀─── RpcResp: SyncRouteInfo ───────────────│
     │     (room peer list)                      │
     │                                           │
```

## RPC 协议

### PeerCenterRpc

- `methodIndex = 0` — **ReportPeers**: Peer 上报自己的直连信息
- `methodIndex = 1` — **GetGlobalPeerMap**: 获取全局 Peer 拓扑图（SHA-256 增量同步）

### OspfRouteRpc

- `methodIndex = 0` — **SyncRouteInfo**: OSPF 风格的路由信息同步
- 支持增量 Peer 信息推送
- 连接位图 (connBitmap) 表示 Peer 间连通性

## Protobuf 定义

协议使用 Protocol Buffers 3 定义，详见 `protos/` 目录：

```
protos/
├── common.proto      # 通用消息类型
├── peer_rpc.proto    # EasyTier Peer RPC 协议
├── error.proto       # 错误类型
└── google/protobuf/
    └── timestamp.proto  # 标准时间戳
```

## 安全设计

### 密钥派生

```javascript
key128 = SHA256(network_secret).slice(0, 16)  // 用于 AES-128-GCM
key256 = SHA256(network_secret)                // 用于 AES-256-GCM
```

### 分组隔离

```javascript
groupKey = SHA256(network_name + ":" + SHA256(network_secret))
```

只有持有相同 `network_name` 和 `network_secret` 的节点才能被分配到同一分组并互相通信。
