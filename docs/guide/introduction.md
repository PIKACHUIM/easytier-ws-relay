# 项目简介

EasyTier WebSocket Relay 是一个运行在 **Cloudflare Workers** 和 **EdgeOne Pages** 上的轻量级 WebSocket 中继服务器，专为 [EasyTier](https://github.com/EasyTier/EasyTier) 去中心化 P2P 网络设计。

## 什么是 EasyTier？

EasyTier 是一个去中心化的 P2P 组网工具，允许位于不同 NAT 后的设备建立直接的点对点连接。它通过 WireGuard 隧道实现安全通信，并支持：

- 虚拟局域网 (VLAN)
- 自动 NAT 穿透
- 多平台支持 (Windows, macOS, Linux, Android, iOS)
- P2P 游戏联机、远程办公等场景

## 中继的作用

在 P2P 网络中，中继（Relay）充当"信号塔"的角色：

1. **节点发现** — 帮助位于不同 NAT 后的节点互相发现
2. **信令转发** — 转发握手、路由同步等控制消息
3. **NAT 穿透辅助** — 交换外网 IP/端口信息，辅助 P2P 打洞

本项目中继服务的特点：

- 🌐 **Serverless** — 无需管理服务器，自动扩缩容
- 📍 **边缘计算** — 部署在全球边缘节点，极低延迟
- 🔒 **安全隔离** — 通过 network_name + network_secret 分组隔离
- 🎯 **轻量高效** — 仅转发控制信令，不转发数据流量

## 技术栈

| 组件 | 技术 |
|------|------|
| **Cloudflare 部署** | Workers + Durable Objects |
| **EdgeOne 部署** | Pages + Go Cloud Functions |
| **通信协议** | WebSocket + EasyTier Binary Protocol |
| **序列化** | Protocol Buffers (Protobuf) |
| **加密** | AES-128/256-GCM, SipHash, SHA-256 |

## 开源许可

本项目使用 [MIT License](https://github.com/EasyTier/easytier-ws-relay/blob/master/LICENSE) 发布。
