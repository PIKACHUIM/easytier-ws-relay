---
layout: home

hero:
  name: "EasyTier WS Relay"
  text: "去中心化 P2P 网络中继"
  tagline: 基于 Cloudflare Workers 和 EdgeOne Pages 的无服务器 WebSocket 中继，为 EasyTier 提供高性能信令转发与路由同步
  image:
    src: /logo.svg
    alt: EasyTier WS Relay
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quickstart
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/EasyTier/easytier-ws-relay
    - theme: alt
      text: 架构原理
      link: /guide/architecture

features:
  - icon: 🌍
    title: 全球边缘加速
    details: 基于 Cloudflare 300+ 边缘节点，就近接入，毫秒级延迟。同时支持 EdgeOne Pages，覆盖全球多 CDN 网络。
  - icon: 🔒
    title: 端到端加密
    details: 支持 AES-128/256-GCM 加密传输，网络密钥派生机制确保只有持有正确密钥的节点才能加入通信组。
  - icon: ⚡
    title: Serverless 架构
    details: Cloudflare Durable Objects 持久化状态，EdgeOne Cloud Functions 运行 Go 服务，自动扩缩容，零维护成本。
  - icon: 📡
    title: OSPF 风格路由
    details: 连接位图 (connBitmap) + 增量路由同步，高效发现 P2P 直连路径，减少中继流量。
  - icon: 📦
    title: Protobuf 协议
    details: 使用 Protocol Buffers 二进制编码进行节点间通信，体积小、解析快，节省带宽。
  - icon: 🚀
    title: 一键部署
    details: 支持 Cloudflare 和 EdgeOne 一键部署，几分钟即可拥有自己的 EasyTier 中继服务器。
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #22d3ee 30%, #a78bfa);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #22d3ee 50%, #a78bfa 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
