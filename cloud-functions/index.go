package main

import (
	"log"
	"net/http"
	"os"

	"github.com/EasyTier/easytier-ws-relay/cloud-functions/relay"
	"github.com/gin-gonic/gin"
)

func main() {
	gin.SetMode(gin.ReleaseMode)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())

	wsPath := getEnv("WS_PATH", "ws")

	// WebSocket relay endpoint
	r.GET("/"+wsPath, relay.HandleWebSocket)
	r.GET("/"+wsPath+"/", relay.HandleWebSocket)

	// Health check
	r.GET("/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	// Landing page
	r.GET("/", serveLandingPage)
	r.NoRoute(serveLandingPage)

	port := getEnv("PORT", "9000")
	log.Printf("EasyTier WS Relay starting on :%s", port)
	log.Printf("WebSocket endpoint: /%s", wsPath)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version, Sec-WebSocket-Extensions")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func serveLandingPage(c *gin.Context) {
	host := c.Request.Host
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}
	wsURL := scheme + "://" + host + "/ws"

	html := `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EasyTier WebSocket Relay</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Space Grotesk',-apple-system,BlinkMacSystemFont,sans-serif;
  background:#0c0a09;color:#fafaf9;min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  overflow-x:hidden;line-height:1.6;
}
body::before{
  content:'';position:fixed;inset:0;
  background:radial-gradient(ellipse at 30% 20%,rgba(34,211,238,0.06) 0%,transparent 50%),
             radial-gradient(ellipse at 70% 80%,rgba(167,139,250,0.04) 0%,transparent 50%);
  pointer-events:none;
}
.container{text-align:center;max-width:600px;padding:40px 24px;position:relative;z-index:1}
.badge{
  display:inline-flex;align-items:center;gap:6px;
  padding:4px 14px;border-radius:20px;
  background:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.15);
  color:#22d3ee;font-size:0.8rem;font-weight:500;margin-bottom:20px;
}
.dot{width:6px;height:6px;border-radius:50%;background:#22d3ee;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
h1{
  font-size:2.5rem;font-weight:700;letter-spacing:-0.04em;line-height:1.15;margin-bottom:14px;
  background:linear-gradient(135deg,#fafaf9 0%,#a8a29e 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
h1 span{background:linear-gradient(135deg,#22d3ee,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.desc{color:#a8a29e;font-size:0.95rem;margin-bottom:32px}
.endpoint{
  background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);
  border-radius:16px;padding:24px;margin-bottom:24px;
  position:relative;overflow:hidden;
}
.endpoint::before{
  content:'';position:absolute;top:0;left:20px;right:20px;height:1px;
  background:linear-gradient(90deg,transparent,#22d3ee,#a78bfa,transparent);
}
.endpoint-label{font-size:0.82rem;font-weight:600;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px}
.endpoint-url{
  font-family:'JetBrains Mono',monospace;font-size:0.9rem;color:#22d3ee;
  word-break:break-all;padding:14px 18px;background:rgba(0,0,0,0.2);
  border-radius:8px;
}
.footer{margin-top:32px;font-size:0.8rem;color:#78716c}
.footer a{color:#a8a29e;text-decoration:none}
.footer a:hover{color:#22d3ee}
a.btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 22px;border-radius:12px;
  background:linear-gradient(135deg,#22d3ee,#a78bfa);
  color:#fff;text-decoration:none;font-weight:600;font-size:0.9rem;
  transition:all .25s;
}
a.btn:hover{box-shadow:0 6px 28px rgba(34,211,238,0.35);transform:translateY(-1px)}
a.btn svg{width:16px;height:16px;fill:currentColor}
</style>
</head>
<body>
<div class="container">
  <div class="badge"><span class="dot"></span>Powered by EdgeOne</div>
  <h1><span>EasyTier</span> WebSocket Relay</h1>
  <p class="desc">Go 驱动的 EasyTier WebSocket 中继服务<br/>运行在 EdgeOne Pages Cloud Functions 上</p>
  <div class="endpoint">
    <div class="endpoint-label">WebSocket Relay Endpoint</div>
    <div class="endpoint-url">` + wsURL + `</div>
  </div>
  <a class="btn" href="https://github.com/EasyTier/easytier-ws-relay" target="_blank" rel="noopener">
    <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    View on GitHub
  </a>
  <div class="footer">Powered by EdgeOne Pages &middot; Go Cloud Functions</div>
</div>
</body>
</html>`

	c.Header("Content-Type", "text/html; charset=UTF-8")
	c.String(http.StatusOK, html)
}
