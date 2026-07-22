# 快速开始

## 使用公共中继

最简单的使用方式是直接使用已部署的公共中继服务。

### 1. 安装 EasyTier

首先确保已安装 [EasyTier](https://github.com/EasyTier/EasyTier) 客户端。

### 2. 配置中继地址

在 EasyTier 配置文件中添加中继配置：

```toml
# ~/.easytier/config.toml
[relay]
url = "wss://your-relay.workers.dev/ws?room=my-network"
```

或者通过命令行参数指定：

```bash
easytier-core --relay "wss://your-relay.workers.dev/ws?room=my-network"
```

### 3. 启动连接

```bash
easytier-core
```

所有使用相同 `room` 参数和 `network_secret` 的节点将自动通过中继互相发现。

## 自部署

如需更好的隐私和性能，可以部署自己的中继服务：

- [部署到 Cloudflare Workers](/deploy/cloudflare)
- [部署到 EdgeOne Pages](/deploy/edgeone)

## 验证连接

部署完成后，可以访问中继地址来查看 Landing Page：

- 打开浏览器访问 `https://your-relay.workers.dev/`
- 会看到精美的 WebSocket 中继主页，包含中继地址、使用指南等信息
