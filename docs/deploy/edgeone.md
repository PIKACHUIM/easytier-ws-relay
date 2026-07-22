# 部署到 EdgeOne Pages

本项目支持部署到腾讯云 EdgeOne Pages，并使用 **Go Cloud Functions** 实现 WebSocket 中继服务。

## EdgeOne Pages 简介

[EdgeOne Pages](https://pages.edgeone.ai) 是腾讯云推出的前端全栈部署平台，支持：

- 静态站点托管
- **Cloud Functions**（Node.js / Python / Go）
- 全球 CDN 加速
- 自动 SSL 证书
- Git 集成自动部署

## Go Cloud Functions 部署

### 前置条件

| 工具 | 说明 |
|------|------|
| [Go](https://go.dev/) >= 1.22 | Go 语言运行时（本地调试用） |
| [EdgeOne CLI](https://www.npmjs.com/package/edgeone) | EdgeOne 命令行工具（可选） |
| [EdgeOne Pages 账号](https://console.cloud.tencent.com/edgeone/pages) | 腾讯云账号 |

### 方式一：控制台导入

1. **登录 EdgeOne Pages 控制台**
   
   访问 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)

2. **创建新项目**
   
   点击「新建项目」→「导入 Git 仓库」→ 选择 `easytier-ws-relay` 仓库

3. **配置构建**

   | 配置项 | 值 |
   |--------|-----|
   | 框架预设 | 自定义 |
   | 构建命令 | (留空) |
   | 输出目录 | (留空) |
   | Node.js 版本 | 20+ |

   > Go Cloud Functions 无需构建配置，EdgeOne 平台自动检测 `cloud-functions/` 目录并进行编译部署。

4. **部署**

   点击「保存并部署」，EdgeOne 会自动：
   - 检测 `cloud-functions/` 下的 Go 项目
   - 编译 Go 代码
   - 将 Go 服务部署到边缘节点
   - 分配访问域名

### 方式二：CLI 部署

```bash
# 1. 安装 EdgeOne CLI
npm install -g edgeone

# 2. 登录
edgeone login

# 3. 部署
edgeone pages deploy -n easytier-ws-relay
```

## Go Cloud Functions 结构

```
cloud-functions/
├── go.mod                      # Go 模块定义
├── go.sum                      # 依赖锁定
├── index.go                    # 入口文件 (package main)
└── relay/
    ├── relay.go                # WebSocket 中继核心逻辑
    └── crypto.go               # 加密模块 (SipHash/AES-GCM/SHA-256)
```

### 入口文件 (`index.go`)

```go
package main

import (
    "github.com/EasyTier/easytier-ws-relay/cloud-functions/relay"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.New()
    
    // WebSocket 中继端点
    r.GET("/ws", relay.HandleWebSocket)
    
    // 主页
    r.GET("/", serveLandingPage)
    
    r.Run(":9000")
}
```

### 核心功能

Go 版本的中继实现了与 JavaScript 版本相同的协议：

- ✅ 16 字节二进制包头解析
- ✅ WebSocket 连接管理
- ✅ Peer 注册与路由
- ✅ 消息转发
- ✅ Ping/Pong 心跳
- ✅ AES-128/256-GCM 加密
- ✅ SipHash-1-3 哈希

## 环境变量

在 EdgeOne Pages 项目设置中添加：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `WS_PATH` | `ws` | WebSocket 路径 |
| `PORT` | `9000` | Go 服务监听端口 |

## 部署后使用

部署完成后，你的中继地址为：

```
https://<your-project>.edgeone.app/ws
```

在 EasyTier 中配置：

```toml
[relay]
url = "wss://<your-project>.edgeone.app/ws?room=my-network"
```

## 本地调试

```bash
cd cloud-functions

# 安装依赖
go mod tidy

# 启动服务
go run .
```

服务监听在 `http://localhost:9000`。

测试 WebSocket 连接：

```bash
# 使用 websocat 测试
websocat ws://localhost:9000/ws?room=test
```

## 注意事项

1. **WebSocket 超时** — EdgeOne 的 WebSocket 连接有超时限制，EasyTier 客户端会自动重连
2. **内存限制** — Cloud Functions 有内存限制，大规模使用时建议使用 Cloudflare Workers 版本
3. **冷启动** — 首次请求可能有冷启动延迟
4. **Go 版本** — EdgeOne 平台使用 Go 1.26 编译，建议本地使用 Go >= 1.22 开发
