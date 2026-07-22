import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EasyTier WS Relay',
  description: '基于 Cloudflare Workers 的 EasyTier WebSocket 中继服务文档',
  lang: 'zh-CN',
  base: '/easytier-ws-relay/',
  
  head: [
    ['link', { rel: 'icon', href: '/easytier-ws-relay/favicon.ico' }],
  ],

  themeConfig: {
    logo: '',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: '部署', link: '/deploy/cloudflare' },
      { text: 'GitHub', link: 'https://github.com/EasyTier/easytier-ws-relay' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '项目简介', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '架构原理', link: '/guide/architecture' },
            { text: '协议说明', link: '/guide/protocol' },
            { text: 'API 参考', link: '/guide/api' },
          ]
        }
      ],
      '/deploy/': [
        {
          text: '部署指南',
          items: [
            { text: 'Cloudflare Workers', link: '/deploy/cloudflare' },
            { text: 'EdgeOne Pages', link: '/deploy/edgeone' },
            { text: '环境变量', link: '/deploy/env' },
            { text: '本地开发', link: '/deploy/development' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EasyTier/easytier-ws-relay' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 EasyTier'
    },

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
