# 快速开始

## 使用公共中继

最简单的使用方式是直接使用已部署的公共中继服务，通过 `-d` + `-p` 参数去中心化组网。

### 1. 安装 EasyTier

首先确保已安装 [EasyTier](https://github.com/EasyTier/EasyTier) 客户端。

### 2. 组网命令

所有节点通过 `-p` 指定同一个中继地址即可互相发现和组网：

```bash
# 节点 A（DHCP 自动分配 IP）
easytier-core -d -p ws://your-relay.workers.dev/ws?room=my-network

# 节点 B
easytier-core -d -p ws://your-relay.workers.dev/ws?room=my-network
```

> ⚠️ 请确保所有节点使用相同的 `room` 名称。不同房间的节点互相隔离。

### 3. 参数说明

| 参数 | 说明 |
|------|------|
| `-d` | DHCP 模式，由 EasyTier 自动为节点分配虚拟 IP |
| `-p` | 指定对端节点地址（peer），支持 `ws://` / `wss://` / `tcp://` / `udp://` 等协议 |
| `--network-name` | 网络名称，相同名称的节点属于同一虚拟网络 |
| `--network-secret` | 网络密钥，用于加密通信 |

### 4. 指定固定 IP

如果需要固定虚拟 IP，可以不使用 `-d` 参数，手动指定：

```bash
# 节点 A（固定 IP）
easytier-core --ipv4 10.0.0.1 -p ws://your-relay.workers.dev/ws?room=my-network

# 节点 B（固定 IP）
easytier-core --ipv4 10.0.0.2 -p ws://your-relay.workers.dev/ws?room=my-network
```

## 组网示例

### 双节点组网

```bash
# 节点 A：启动监听 + 指定中继
sudo easytier-core -d -p ws://relay.example.com/ws?room=office

# 节点 B：同样指定相同中继即可加入
sudo easytier-core -d -p ws://relay.example.com/ws?room=office
```

节点 A 和 B 启动后会自动通过中继发现对方，建立 P2P 连接。成功后可以通过虚拟 IP 互相通信。

### 三节点组网

```bash
# 所有节点连接同一个中继
sudo easytier-core -d -p ws://relay.example.com/ws?room=office
```

新节点只需连接中继即可自动加入网络，之后能与所有已有节点通信。

## 自部署

如需更好的隐私和性能，可以部署自己的中继服务：

- [部署到 Cloudflare Workers](/deploy/cloudflare)
- [部署到 EdgeOne Pages](/deploy/edgeone)

## 参考

更多组网方式请参阅 [EasyTier 官方文档 - 去中心组网](https://easytier.cn/guide/network/decentralized-networking.html)
