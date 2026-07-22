// Cloudflare Worker entry for EasyTier WebSocket relay backed by Durable Object
// Module syntax is required for Durable Objects.
import { RelayRoom } from './worker/relay_room';

export { RelayRoom };

// ── Landing Page HTML ──────────────────────────────────────────────────────
function serveLandingPage(request, env) {
  const url = new URL(request.url);
  const wsPath = '/' + (env.WS_PATH || 'ws');
  const wsUrl = url.origin + wsPath;
  const githubUrl = 'https://github.com/EasyTier/easytier-ws-relay';
  const easyTierUrl = 'https://github.com/EasyTier/EasyTier';

  return new Response(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EasyTier WebSocket Relay</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg-primary:#0c0a09;
  --bg-secondary:#1c1917;
  --bg-card:rgba(255,255,255,0.04);
  --bg-card-hover:rgba(255,255,255,0.07);
  --border-color:rgba(255,255,255,0.06);
  --border-hover:rgba(255,255,255,0.12);
  --text-primary:#fafaf9;
  --text-secondary:#a8a29e;
  --text-muted:#78716c;
  --accent:#22d3ee;
  --accent-dim:rgba(34,211,238,0.12);
  --accent-glow:rgba(34,211,238,0.25);
  --green:#34d399;
  --green-dim:rgba(52,211,153,0.15);
  --purple:#a78bfa;
  --purple-dim:rgba(167,139,250,0.12);
  --font-heading:'Space Grotesk',-apple-system,BlinkMacSystemFont,sans-serif;
  --font-body:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
  --font-mono:'JetBrains Mono',monospace;
  --radius:12px;
  --radius-lg:16px;
  --transition:0.25s cubic-bezier(0.4,0,0.2,1);
}
:root[data-theme='light']{
  --bg-primary:#f4f2ee;
  --bg-secondary:#ffffff;
  --bg-card:rgba(0,0,0,0.03);
  --bg-card-hover:rgba(0,0,0,0.06);
  --border-color:rgba(0,0,0,0.08);
  --border-hover:rgba(0,0,0,0.15);
  --text-primary:#1c1917;
  --text-secondary:#57534e;
  --text-muted:#a8a29e;
  --accent:#0891b2;
  --accent-dim:rgba(8,145,178,0.1);
  --accent-glow:rgba(8,145,178,0.2);
  --green:#059669;
  --green-dim:rgba(5,150,105,0.1);
  --purple:#7c3aed;
  --purple-dim:rgba(124,58,237,0.08);
}
:root[data-theme='light'] body::before{
  background:radial-gradient(ellipse at 30% 20%,rgba(8,145,178,0.05) 0%,transparent 50%),
             radial-gradient(ellipse at 70% 80%,rgba(124,58,237,0.03) 0%,transparent 50%);
}
:root[data-theme='light'] .hero-title{
  background:linear-gradient(135deg,#1c1917 0%,#57534e 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
:root[data-theme='light'] .endpoint-url{background:rgba(0,0,0,0.04)}
:root[data-theme='light'] .spec-item-icon{background:rgba(0,0,0,0.06)}
:root[data-theme='light'] .guide-section pre{background:rgba(0,0,0,0.04)}
:root[data-theme='light'] .install-step pre{background:rgba(0,0,0,0.04)}
html{scroll-behavior:smooth}
body{
  font-family:var(--font-body);
  background:var(--bg-primary);
  color:var(--text-primary);
  min-height:100vh;
  overflow-x:hidden;
  line-height:1.6;
}
body::before{
  content:'';position:fixed;top:-50%;left:-50%;width:200%;height:200%;
  background:radial-gradient(ellipse at 30% 20%,rgba(34,211,238,0.06) 0%,transparent 50%),
             radial-gradient(ellipse at 70% 80%,rgba(167,139,250,0.04) 0%,transparent 50%);
  pointer-events:none;z-index:0;
}
body::after{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    linear-gradient(90deg,rgba(34,211,238,0.02) 1px,transparent 1px),
    linear-gradient(rgba(34,211,238,0.02) 1px,transparent 1px);
  background-size:60px 60px;
}
.app{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:32px 24px 60px}

/* Toolbar */
.toolbar{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:flex-end;gap:8px;
  padding:12px 20px;
  background:rgba(12,10,9,0.7);backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border-color);
}
:root[data-theme='light'] .toolbar{background:rgba(244,242,238,0.7)}
.toolbar-btn{
  display:inline-flex;align-items:center;justify-content:center;
  height:34px;padding:0 12px;border-radius:8px;
  border:1px solid var(--border-color);
  background:var(--bg-card);
  color:var(--text-muted);cursor:pointer;
  transition:var(--transition);
  font-family:var(--font-body);font-size:0.78rem;font-weight:500;
  white-space:nowrap;
}
.toolbar-btn:hover{color:var(--text-primary);border-color:var(--border-hover)}
.toolbar-btn.active{background:var(--accent-dim);color:var(--accent);border-color:rgba(34,211,238,0.2)}
.toolbar-btn.icon{width:34px;padding:0}
.toolbar-btn.icon svg{width:16px;height:16px}
:root[data-theme='light'] .toolbar-btn.active{color:var(--accent);border-color:rgba(8,145,178,0.25)}

/* Hero */
.hero{text-align:center;padding:60px 0 40px;animation:fadeUp .6s ease-out}
.hero-badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 14px;border-radius:20px;
  background:var(--accent-dim);border:1px solid rgba(34,211,238,0.15);
  color:var(--accent);font-size:0.8rem;font-weight:500;
  margin-bottom:20px;
}
.hero-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.hero-title{
  font-family:var(--font-heading);font-size:2.5rem;font-weight:700;
  letter-spacing:-0.04em;line-height:1.15;margin-bottom:14px;
  background:linear-gradient(135deg,#fafaf9 0%,#a8a29e 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-title .gradient{
  background:linear-gradient(135deg,var(--accent) 0%,var(--purple) 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-desc{
  color:var(--text-secondary);font-size:0.95rem;max-width:520px;
  margin:0 auto 32px;line-height:1.7;
}

/* Buttons */
.hero-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:12px 26px;border-radius:var(--radius);
  font-family:var(--font-body);font-size:0.9rem;font-weight:600;
  cursor:pointer;transition:var(--transition);
  text-decoration:none;
}
.btn-primary{
  background:linear-gradient(135deg,var(--accent),var(--purple));
  color:#fff;border:none;
  box-shadow:0 4px 20px rgba(34,211,238,0.2);
}
.btn-primary:hover{box-shadow:0 6px 28px rgba(34,211,238,0.35);transform:translateY(-1px)}
.btn-ghost{
  background:transparent;color:var(--text-secondary);
  border:1px solid var(--border-color);
}
.btn-ghost:hover{color:var(--text-primary);border-color:var(--border-hover);background:var(--bg-card)}

/* Endpoint Card */
.endpoint-card{
  background:var(--bg-card);border:1px solid var(--border-color);
  border-radius:var(--radius-lg);padding:24px;margin-bottom:32px;
  animation:fadeUp .6s ease-out .1s both;
  position:relative;overflow:hidden;
}
.endpoint-card::before{
  content:'';position:absolute;top:0;left:20px;right:20px;height:1px;
  background:linear-gradient(90deg,transparent,var(--accent),var(--purple),transparent);
}
.endpoint-label{
  font-family:var(--font-heading);font-size:0.82rem;font-weight:600;
  color:var(--text-muted);text-transform:uppercase;
  letter-spacing:0.05em;margin-bottom:12px;
}
.endpoint-url{
  font-family:var(--font-mono);font-size:0.9rem;color:var(--accent);
  word-break:break-all;
  padding:14px 18px;background:rgba(0,0,0,0.2);
  border-radius:8px;display:flex;align-items:center;
  justify-content:space-between;gap:12px;
}
.endpoint-url .url-text{flex:1;min-width:0}
.copy-btn{
  padding:6px 14px;border:1px solid var(--border-color);
  border-radius:6px;background:transparent;
  color:var(--text-secondary);font-size:0.78rem;
  cursor:pointer;transition:var(--transition);
  white-space:nowrap;font-family:var(--font-body);
}
.copy-btn:hover{border-color:var(--accent);color:var(--accent)}
.copy-btn.copied{border-color:var(--green);color:var(--green)}
.endpoint-meta{
  display:flex;gap:16px;margin-top:14px;flex-wrap:wrap;
  color:var(--text-muted);font-size:0.8rem;font-family:var(--font-mono);
}
.endpoint-meta span{display:inline-flex;align-items:center;gap:4px}
.endpoint-meta .meta-key{opacity:0.6}

/* Tab Navigation */
.tab-nav{
  display:flex;gap:4px;padding:4px;
  background:var(--bg-card);border:1px solid var(--border-color);
  border-radius:var(--radius);margin-bottom:28px;
  animation:fadeUp .6s ease-out .15s both;
}
.tab-btn{
  flex:1;padding:12px 20px;border:none;border-radius:9px;
  font-family:var(--font-body);font-size:0.9rem;font-weight:500;
  color:var(--text-muted);background:transparent;cursor:pointer;
  transition:var(--transition);
  display:flex;align-items:center;justify-content:center;gap:8px;
}
.tab-btn:hover{color:var(--text-secondary)}
.tab-btn.active{
  background:var(--accent-dim);color:var(--accent);
  box-shadow:0 0 0 1px rgba(34,211,238,0.2);
}
.tab-btn svg{width:18px;height:18px;flex-shrink:0}
.tab-panel{display:none;animation:fadeUp .35s ease-out}
.tab-panel.active{display:block}

/* Guide Content */
.guide-section{
  background:var(--bg-card);border:1px solid var(--border-color);
  border-radius:var(--radius);padding:24px;margin-bottom:16px;
}
.guide-section:last-child{margin-bottom:0}
.guide-section h3{
  font-family:var(--font-heading);font-size:1.05rem;font-weight:600;
  color:var(--text-primary);margin-bottom:14px;
  display:flex;align-items:center;gap:10px;
}
.guide-section h3 .icon{
  display:inline-flex;align-items:center;justify-content:center;
  width:30px;height:30px;border-radius:8px;flex-shrink:0;
  background:var(--accent-dim);border:1px solid rgba(34,211,238,0.15);
}
.guide-section h3 .icon svg{width:16px;height:16px}
.guide-section p{
  color:var(--text-secondary);font-size:0.88rem;line-height:1.7;margin-bottom:14px;
}
.guide-section p strong{color:var(--text-primary);font-weight:500}

/* Code blocks */
.guide-section pre{
  padding:16px 18px;background:rgba(0,0,0,0.25);border-radius:8px;
  position:relative;margin-bottom:10px;overflow-x:auto;
}
.guide-section pre code{
  font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);
  line-height:1.8;white-space:pre-wrap;word-break:break-all;display:block;
}
.guide-section .cmd-comment{color:var(--text-muted)}
.guide-section .copy-code{
  position:absolute;top:10px;right:10px;
  padding:4px 12px;border:1px solid var(--border-color);
  border-radius:6px;background:transparent;color:var(--text-secondary);
  font-size:0.72rem;cursor:pointer;transition:var(--transition);
  font-family:var(--font-body);
}
.guide-section .copy-code:hover{border-color:var(--accent);color:var(--accent)}
.guide-section .copy-code.copied{border-color:var(--green);color:var(--green)}

/* Step List */
.step{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.step:last-child{margin-bottom:0}
.step-num{
  display:inline-flex;align-items:center;justify-content:center;
  width:26px;height:26px;border-radius:50%;flex-shrink:0;
  background:var(--accent-dim);border:1px solid rgba(34,211,238,0.2);
  color:var(--accent);font-size:0.78rem;font-weight:600;
  font-family:var(--font-heading);margin-top:1px;
}
.step-text{flex:1;color:var(--text-secondary);font-size:0.88rem;line-height:1.6}
.step-text code{
  padding:1px 6px;border-radius:4px;background:rgba(0,0,0,0.3);
  font-family:var(--font-mono);font-size:0.82rem;color:var(--accent);
}
:root[data-theme='light'] .step-text code{background:rgba(0,0,0,0.07)}

/* Spec Grid */
.spec-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
  gap:12px;
}
.spec-item{
  background:var(--bg-card);border:1px solid var(--border-color);
  border-radius:var(--radius);padding:18px;
  transition:var(--transition);
}
.spec-item:hover{background:var(--bg-card-hover);border-color:var(--border-hover);transform:translateY(-2px)}
.spec-item-icon{
  display:inline-flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:8px;
  background:rgba(0,0,0,0.2);margin-bottom:10px;
}
.spec-item-icon svg{width:20px;height:20px}
.spec-item h4{font-family:var(--font-heading);font-size:0.9rem;font-weight:600;margin-bottom:4px}
.spec-item p{color:var(--text-muted);font-size:0.8rem;line-height:1.5}

/* Install Steps */
.install-step{display:flex;gap:16px;align-items:flex-start;margin-bottom:16px}
.install-step:last-child{margin-bottom:0}
.install-num{
  display:flex;align-items:center;justify-content:center;
  width:36px;height:36px;border-radius:10px;flex-shrink:0;
  background:var(--accent-dim);border:1px solid rgba(34,211,238,0.15);
  color:var(--accent);font-size:0.95rem;font-weight:700;
  font-family:var(--font-heading);
}
.install-body{flex:1}
.install-body h4{font-size:0.9rem;font-weight:600;margin-bottom:6px}
.install-body p{color:var(--text-secondary);font-size:0.85rem;margin-bottom:8px;line-height:1.6}
.install-body pre{
  padding:10px 14px;background:rgba(0,0,0,0.25);border-radius:6px;
  margin-bottom:6px;
}
.install-body pre code{
  font-family:var(--font-mono);font-size:0.8rem;color:var(--text-secondary);
  line-height:1.7;white-space:pre-wrap;word-break:break-all;
}

/* Note */
.note{
  padding:14px 18px;background:var(--purple-dim);border:1px solid rgba(167,139,250,0.15);
  border-radius:8px;color:var(--text-secondary);font-size:0.84rem;line-height:1.6;
  margin-top:14px;
}
.note::before{content:'💡 '}

/* Footer */
.footer{
  text-align:center;margin-top:48px;padding-top:24px;
  border-top:1px solid var(--border-color);
  color:var(--text-muted);font-size:0.8rem;
}
.footer a{color:var(--text-secondary);text-decoration:none;transition:var(--transition)}
.footer a:hover{color:var(--accent)}
.footer-links{display:flex;justify-content:center;gap:20px;margin-bottom:8px}
.footer-links a{display:inline-flex;align-items:center;gap:6px;color:var(--text-muted);font-size:0.78rem;text-decoration:none;transition:var(--transition)}
.footer-links a:hover{color:var(--accent)}
.footer-links a svg{width:16px;height:16px}

/* Animations */
@keyframes fadeUp{
  from{opacity:0;transform:translateY(12px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes pulseGlow{
  0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,0.3)}
  50%{box-shadow:0 0 0 8px rgba(34,211,238,0)}
}
.endpoint-card{animation:pulseGlow 3s infinite}

/* Responsive */
@media(max-width:640px){
  .app{padding:24px 16px 40px}
  .hero{padding:40px 0 28px}
  .hero-title{font-size:1.7rem}
  .tab-btn{padding:10px 12px;font-size:0.84rem}
  .spec-grid{grid-template-columns:1fr}
  .hero-actions{flex-direction:column;align-items:center}
}
</style>
</head>
<body>
  <!-- Toolbar -->
  <div class="toolbar">
    <button class="toolbar-btn icon" id="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
      <svg id="theme-sun" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="display:none"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round"/></svg>
      <svg id="theme-moon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-linecap="round"/></svg>
    </button>
    <div style="display:flex;gap:0;border:1px solid var(--border-color);border-radius:8px;overflow:hidden">
      <button class="toolbar-btn" data-lang="zh" onclick="setLang('zh')" style="border:none;border-radius:0">中</button>
      <button class="toolbar-btn" data-lang="en" onclick="setLang('en')" style="border:none;border-radius:0">EN</button>
    </div>
    <a class="toolbar-btn" href="${githubUrl}" target="_blank" rel="noopener" style="text-decoration:none">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      GitHub
    </a>
  </div>

  <div class="app">
    <!-- Hero -->
    <header class="hero">
      <div class="hero-badge"><span class="dot"></span><span data-i18n="badge">去中心化 P2P 网络中继</span></div>
      <h1 class="hero-title"><span class="gradient" data-i18n="title">EasyTier</span> <span data-i18n="title2">WebSocket Relay</span></h1>
      <p class="hero-desc" data-i18n="desc">基于 Cloudflare Workers 的无服务器 WebSocket 中继，为 EasyTier 去中心化 P2P 网络提供高性能的信令转发与路由同步服务</p>
      <div class="hero-actions">
        <a href="${githubUrl}" class="btn btn-primary" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          <span data-i18n="btn.github">GitHub</span>
        </a>
        <a href="${easyTierUrl}" class="btn btn-ghost" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span data-i18n="btn.easytier">EasyTier 项目</span>
        </a>
        <button class="btn btn-ghost" onclick="scrollToGuide()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          <span data-i18n="btn.guide">使用指南</span>
        </button>
      </div>
    </header>

    <!-- Endpoint Card -->
    <div class="endpoint-card">
      <div class="endpoint-label" data-i18n="endpoint.label">WebSocket 中继地址</div>
      <div class="endpoint-url">
        <span class="url-text" id="endpoint-url">${wsUrl}</span>
        <button class="copy-btn" onclick="copyEndpoint()" data-i18n="btn.copy">复制</button>
      </div>
      <div class="endpoint-meta">
        <span><span class="meta-key">Room: </span>?room=&lt;network_name&gt;</span>
        <span><span class="meta-key">Protocol: </span>EasyTier Binary</span>
        <span><span class="meta-key">PeerID: </span>10000001</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <nav class="tab-nav" id="guide-anchor">
      <button class="tab-btn active" data-tab="quickstart" onclick="switchTab('quickstart')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span data-i18n="tab.quickstart">快速开始</span>
      </button>
      <button class="tab-btn" data-tab="usage" onclick="switchTab('usage')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span data-i18n="tab.usage">使用配置</span>
      </button>
      <button class="tab-btn" data-tab="deploy" onclick="switchTab('deploy')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span data-i18n="tab.deploy">自部署</span>
      </button>
      <button class="tab-btn" data-tab="arch" onclick="switchTab('arch')">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span data-i18n="tab.arch">架构原理</span>
      </button>
    </nav>

    <!-- Tab: Quickstart -->
    <div id="panel-quickstart" class="tab-panel active">
      <div class="guide-section">
        <h3><span class="icon"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span data-i18n="qs.title">使用公共中继</span></h3>
        <p data-i18n="qs.desc">在 EasyTier 配置文件中添加以下配置，即可使用公共中继服务：</p>
        <pre><code><span class="cmd-comment"># ~/.easytier/config.toml</span>
[relay]
url = <span class="accent-code">"${wsUrl}?room=&lt;your_network_name&gt;"</span></code><button class="copy-code" onclick="copyCode(this)">复制</button></pre>
        <div class="note" data-i18n="qs.note">每个不同网络名称 (network_name) 的节点会被隔离在不同的虚拟房间中。请为你和你的同伴使用相同的 network_name。</div>
      </div>
    </div>

    <!-- Tab: Usage -->
    <div id="panel-usage" class="tab-panel">
      <div class="guide-section">
        <h3><span class="icon"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span data-i18n="usage.title">EasyTier 客户端配置</span></h3>
        <p data-i18n="usage.desc">在 EasyTier 客户端中通过命令行或配置文件指定中继地址：</p>
        <pre><code><span class="cmd-comment"># 命令行方式</span>
easytier-core --relay <span class="accent-code">"${wsUrl}?room=my-network"</span>

<span class="cmd-comment"># 配置文件方式 (config.toml)</span>
[relay]
url = <span class="accent-code">"${wsUrl}?room=my-network"</span>

<span class="cmd-comment"># 多中继 (主备)</span>
[[relay]]
url = <span class="accent-code">"${wsUrl}?room=my-network"</span>

[[relay]]
url = <span class="accent-code">"wss://your-own-relay.example.com/ws?room=my-network"</span></code><button class="copy-code" onclick="copyCode(this)">复制</button></pre>
      </div>
      <div class="guide-section">
        <h3><span class="icon"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span data-i18n="usage.params">URL 参数说明</span></h3>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
          <thead><tr style="border-bottom:1px solid var(--border-color);text-align:left"><th style="padding:8px 12px;color:var(--text-muted);font-weight:500">参数</th><th style="padding:8px 12px;color:var(--text-muted);font-weight:500">类型</th><th style="padding:8px 12px;color:var(--text-muted);font-weight:500">说明</th></tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid var(--border-color)"><td style="padding:8px 12px;font-family:var(--font-mono);font-size:0.82rem;color:var(--accent)">room</td><td style="padding:8px 12px;color:var(--text-muted)">string</td><td style="padding:8px 12px;color:var(--text-secondary)">网络房间名，相同名称的节点可互相发现</td></tr>
            <tr style="border-bottom:1px solid var(--border-color)"><td style="padding:8px 12px;font-family:var(--font-mono);font-size:0.82rem;color:var(--accent)">network_name</td><td style="padding:8px 12px;color:var(--text-muted)">string</td><td style="padding:8px 12px;color:var(--text-secondary)">网络名称 (用于分组隔离)</td></tr>
            <tr><td style="padding:8px 12px;font-family:var(--font-mono);font-size:0.82rem;color:var(--accent)">network_secret</td><td style="padding:8px 12px;color:var(--text-muted)">string</td><td style="padding:8px 12px;color:var(--text-secondary)">网络密钥 (用于加密通信)</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Deploy -->
    <div id="panel-deploy" class="tab-panel">
      <div class="guide-section">
        <h3><span class="icon"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5 5-5m-5 5V3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span data-i18n="deploy.title">自部署指南</span></h3>
        <p data-i18n="deploy.desc">你可以将中继服务部署到自己的 Cloudflare 账号下，获得更好的性能和隐私：</p>
        <div class="install-step">
          <div class="install-num">1</div>
          <div class="install-body">
            <h4 data-i18n="deploy.step1.title">安装 Wrangler CLI</h4>
            <p data-i18n="deploy.step1.desc">使用 npm 全局安装 Cloudflare Wrangler 命令行工具：</p>
            <pre><code>npm install -g wrangler</code></pre>
          </div>
        </div>
        <div class="install-step">
          <div class="install-num">2</div>
          <div class="install-body">
            <h4 data-i18n="deploy.step2.title">克隆项目并安装依赖</h4>
            <p data-i18n="deploy.step2.desc">获取源代码并安装必要的依赖：</p>
            <pre><code>git clone ${githubUrl}.git
cd easytier-ws-relay
pnpm install</code></pre>
          </div>
        </div>
        <div class="install-step">
          <div class="install-num">3</div>
          <div class="install-body">
            <h4 data-i18n="deploy.step3.title">登录并部署</h4>
            <p data-i18n="deploy.step3.desc">登录 Cloudflare 账号并一键部署：</p>
            <pre><code>wrangler login
wrangler deploy</code></pre>
          </div>
        </div>
        <div class="note" data-i18n="deploy.note">部署完成后，你的中继地址将是 <code>https://your-worker.workers.dev/ws</code>，将其填入 EasyTier 配置即可。</div>
      </div>
    </div>

    <!-- Tab: Architecture -->
    <div id="panel-arch" class="tab-panel">
      <div class="spec-grid">
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--accent)" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-linecap="round"/></svg></div>
          <h4 data-i18n="spec.global">全球边缘加速</h4>
          <p data-i18n="spec.global.desc">基于 Cloudflare 全球网络，300+ 边缘节点就近接入，毫秒级延迟</p>
        </div>
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--green)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h4 data-i18n="spec.secure">端到端加密</h4>
          <p data-i18n="spec.secure.desc">支持 AES-128/256-GCM 加密，网络密钥派生，确保数据传输安全</p>
        </div>
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--purple)" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8m-4-4v4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h4 data-i18n="spec.serveless">Serverless 架构</h4>
          <p data-i18n="spec.serveless.desc">Cloudflare Durable Objects 持久化状态，自动扩缩容，零维护成本</p>
        </div>
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--accent)" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10m-6 10V4m-6 10v6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h4 data-i18n="spec.routing">OSPF 风格路由</h4>
          <p data-i18n="spec.routing.desc">连接位图 (connBitmap) + 增量路由同步，高效发现 P2P 路径</p>
        </div>
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--green)" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h4 data-i18n="spec.protobuf">Protobuf 协议</h4>
          <p data-i18n="spec.protobuf.desc">使用 Protocol Buffers 二进制编码，体积小、解析快</p>
        </div>
        <div class="spec-item">
          <div class="spec-item-icon"><svg fill="none" stroke="var(--purple)" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <h4 data-i18n="spec.multi">多方通信</h4>
          <p data-i18n="spec.multi.desc">支持多节点组网，同一房间内所有节点可互相发现和通信</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-links">
        <a href="${githubUrl}" target="_blank" rel="noopener">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <a href="${easyTierUrl}" target="_blank" rel="noopener">EasyTier</a>
        <a href="https://pages.edgeone.ai" target="_blank" rel="noopener">EdgeOne</a>
      </div>
      <span data-i18n="footer">Powered by Cloudflare Workers &amp; EdgeOne Pages</span>
    </footer>
  </div>

  <script>
  // ── i18n ──
  var I18N={
    zh:{
      'badge':'去中心化 P2P 网络中继','title':'EasyTier','title2':'WebSocket Relay',
      'desc':'基于 Cloudflare Workers 的无服务器 WebSocket 中继，为 EasyTier 去中心化 P2P 网络提供高性能的信令转发与路由同步服务',
      'btn.github':'GitHub','btn.easytier':'EasyTier 项目','btn.guide':'使用指南','btn.copy':'复制','btn.copied':'已复制',
      'endpoint.label':'WebSocket 中继地址',
      'tab.quickstart':'快速开始','tab.usage':'使用配置','tab.deploy':'自部署','tab.arch':'架构原理',
      'qs.title':'使用公共中继','qs.desc':'在 EasyTier 配置文件中添加以下配置，即可使用公共中继服务：',
      'qs.note':'每个不同网络名称 (network_name) 的节点会被隔离在不同的虚拟房间中。请为你和你的同伴使用相同的 network_name。',
      'usage.title':'EasyTier 客户端配置','usage.desc':'在 EasyTier 客户端中通过命令行或配置文件指定中继地址：',
      'usage.params':'URL 参数说明',
      'deploy.title':'自部署指南','deploy.desc':'你可以将中继服务部署到自己的 Cloudflare 账号下，获得更好的性能和隐私：',
      'deploy.step1.title':'安装 Wrangler CLI','deploy.step1.desc':'使用 npm 全局安装 Cloudflare Wrangler 命令行工具：',
      'deploy.step2.title':'克隆项目并安装依赖','deploy.step2.desc':'获取源代码并安装必要的依赖：',
      'deploy.step3.title':'登录并部署','deploy.step3.desc':'登录 Cloudflare 账号并一键部署：',
      'deploy.note':'部署完成后，你的中继地址将是 <code>https://your-worker.workers.dev/ws</code>，将其填入 EasyTier 配置即可。',
      'spec.global':'全球边缘加速','spec.global.desc':'基于 Cloudflare 全球网络，300+ 边缘节点就近接入，毫秒级延迟',
      'spec.secure':'端到端加密','spec.secure.desc':'支持 AES-128/256-GCM 加密，网络密钥派生，确保数据传输安全',
      'spec.serveless':'Serverless 架构','spec.serveless.desc':'Cloudflare Durable Objects 持久化状态，自动扩缩容，零维护成本',
      'spec.routing':'OSPF 风格路由','spec.routing.desc':'连接位图 (connBitmap) + 增量路由同步，高效发现 P2P 路径',
      'spec.protobuf':'Protobuf 协议','spec.protobuf.desc':'使用 Protocol Buffers 二进制编码，体积小、解析快',
      'spec.multi':'多方通信','spec.multi.desc':'支持多节点组网，同一房间内所有节点可互相发现和通信',
      'footer':'基于 Cloudflare Workers & EdgeOne Pages 构建'
    },
    en:{
      'badge':'Decentralized P2P Network Relay','title':'EasyTier','title2':'WebSocket Relay',
      'desc':'A serverless WebSocket relay built on Cloudflare Workers, providing high-performance signaling and route synchronization for the EasyTier decentralized P2P network',
      'btn.github':'GitHub','btn.easytier':'EasyTier Project','btn.guide':'User Guide','btn.copy':'Copy','btn.copied':'Copied',
      'endpoint.label':'WebSocket Relay Endpoint',
      'tab.quickstart':'Quick Start','tab.usage':'Configuration','tab.deploy':'Self Host','tab.arch':'Architecture',
      'qs.title':'Using Public Relay','qs.desc':'Add the following configuration to your EasyTier config file to use the public relay:',
      'qs.note':'Nodes with different network names are isolated in separate virtual rooms. Use the same network_name for you and your peers.',
      'usage.title':'EasyTier Client Config','usage.desc':'Specify the relay address via CLI or config file in EasyTier:',
      'usage.params':'URL Parameters',
      'deploy.title':'Self-Host Guide','deploy.desc':'Deploy the relay service to your own Cloudflare account for better performance and privacy:',
      'deploy.step1.title':'Install Wrangler CLI','deploy.step1.desc':'Install Cloudflare Wrangler CLI globally via npm:',
      'deploy.step2.title':'Clone & Install Dependencies','deploy.step2.desc':'Get the source code and install dependencies:',
      'deploy.step3.title':'Login & Deploy','deploy.step3.desc':'Login to your Cloudflare account and deploy with one command:',
      'deploy.note':'After deployment, your relay endpoint will be <code>https://your-worker.workers.dev/ws</code>. Use it in your EasyTier config.',
      'spec.global':'Global Edge Network','spec.global.desc':'300+ edge nodes worldwide, low-latency access from anywhere',
      'spec.secure':'End-to-End Encryption','spec.secure.desc':'AES-128/256-GCM encryption with network key derivation for secure data transmission',
      'spec.serveless':'Serverless Architecture','spec.serveless.desc':'Cloudflare Durable Objects for state persistence, auto-scaling, zero maintenance',
      'spec.routing':'OSPF-style Routing','spec.routing.desc':'Connection bitmap + incremental route sync for efficient P2P path discovery',
      'spec.protobuf':'Protobuf Protocol','spec.protobuf.desc':'Protocol Buffers binary encoding for compact size and fast parsing',
      'spec.multi':'Multi-Peer','spec.multi.desc':'Multi-node networking: all peers in the same room can discover and communicate',
      'footer':'Powered by Cloudflare Workers & EdgeOne Pages'
    }
  };
  var curLang=(function(){
    var s=localStorage.getItem('lang');
    if(s&&I18N[s])return s;
    return(navigator.language||'').toLowerCase().startsWith('zh')?'zh':'en';
  })();
  function t(k){
    return(I18N[curLang]&&I18N[curLang][k])||(I18N.zh[k])||k;
  }
  function applyI18n(){
    document.title='EasyTier WebSocket Relay';
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      el.innerHTML=t(el.getAttribute('data-i18n'));
    });
  }
  function setLang(l){
    curLang=l;localStorage.setItem('lang',l);applyI18n();
    document.querySelectorAll('[data-lang]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-lang')===l)});
  }

  // ── Theme ──
  var curTheme=(function(){
    var s=localStorage.getItem('theme');
    if(s==='light'||s==='dark')return s;
    return window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';
  })();
  document.documentElement.setAttribute('data-theme',curTheme);
  function toggleTheme(){
    curTheme=curTheme==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',curTheme);
    localStorage.setItem('theme',curTheme);
    var sun=document.getElementById('theme-sun');
    var moon=document.getElementById('theme-moon');
    if(curTheme==='dark'){sun.style.display='none';moon.style.display='block'}
    else{sun.style.display='block';moon.style.display='none'}
  }
  function updateThemeIcon(){
    var sun=document.getElementById('theme-sun');
    var moon=document.getElementById('theme-moon');
    if(curTheme==='dark'){sun.style.display='none';moon.style.display='block'}
    else{sun.style.display='block';moon.style.display='none'}
  }

  // ── Tab Switch ──
  function switchTab(name){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active')});
    document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active')});
    document.querySelector('.tab-btn[data-tab="'+name+'"]').classList.add('active');
    document.getElementById('panel-'+name).classList.add('active');
  }

  // ── Copy ──
  function copyEndpoint(){
    var u=document.getElementById('endpoint-url').textContent;
    navigator.clipboard.writeText(u).then(function(){
      var b=document.querySelector('.copy-btn');
      b.textContent=t('btn.copied');b.classList.add('copied');
      setTimeout(function(){b.textContent=t('btn.copy');b.classList.remove('copied')},1800);
    });
  }
  function copyCode(btn){
    var pre=btn.parentElement;
    var code=pre.querySelector('code');
    var text=code.innerText||code.textContent;
    navigator.clipboard.writeText(text).then(function(){
      btn.textContent=t('btn.copied');btn.classList.add('copied');
      setTimeout(function(){btn.textContent=t('btn.copy');btn.classList.remove('copied')},1800);
    });
  }
  function scrollToGuide(){
    document.getElementById('guide-anchor').scrollIntoView({behavior:'smooth'});
  }

  // ── Init ──
  window.addEventListener('load',function(){
    applyI18n();
    document.querySelectorAll('[data-lang]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-lang')===curLang)});
    updateThemeIcon();
  });
  </script>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
}

// ── Main Worker Entry ─────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    if (pathname === '/healthz') {
      return new Response('ok', { status: 200 });
    }

    const wsPath = '/' + (env.WS_PATH || 'ws');
    if (pathname === wsPath || pathname === wsPath + '/') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        // Return landing page when accessing WS path without WebSocket upgrade (browser visit)
        return serveLandingPage(request, env);
      }

      const roomId = searchParams.get('room') || 'default';
      const roomStub = env.RELAY_ROOM.get(env.RELAY_ROOM.idFromName(roomId));
      return roomStub.fetch(request);
    }

    // Root path or other browser requests → show landing page
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();
    if (pathname === '/' || ua.includes('mozilla')) {
      return serveLandingPage(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};
