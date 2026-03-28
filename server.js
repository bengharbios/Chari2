#!/usr/bin/env node
/**
 * TakZone - Production Server Entry Point
 * Compatible with Hostinger deployment
 */

const path = require('path');
const fs = require('fs');
const http = require('http');

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

// Check if standalone build exists
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('🚀 Starting Next.js standalone server...');
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  require(standaloneServer);
} else {
  console.log('⚠️ Standalone build not found!');
  console.log('📁 Looking for:', standaloneServer);
  console.log('');
  
  // Create a simple HTML response server
  const server = http.createServer((req, res) => {
    const url = req.url;
    
    // Health check endpoint
    if (url === '/health' || url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        message: 'Server is running',
        build: fs.existsSync(standaloneDir) ? 'found' : 'not found',
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TakZone - جاري التحميل</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Cairo', sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); 
            color: white; 
          }
          .container { 
            text-align: center; 
            padding: 2rem; 
            max-width: 500px;
          }
          .logo { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
          }
          h1 { 
            font-size: 2.5rem; 
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p { opacity: 0.8; margin-bottom: 1rem; }
          .loader { 
            width: 50px; 
            height: 50px; 
            border: 3px solid rgba(255,255,255,0.3); 
            border-top-color: #60a5fa; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 2rem auto; 
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .info { 
            background: rgba(255,255,255,0.1); 
            padding: 1rem; 
            border-radius: 8px; 
            margin-top: 2rem;
            font-size: 0.9rem;
          }
          .info code {
            background: rgba(0,0,0,0.3);
            padding: 2px 6px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🛒</div>
          <h1>TakZone</h1>
          <p>منصة التجارة الإلكترونية الشاملة</p>
          <div class="loader"></div>
          <p>جاري تشغيل الموقع...</p>
          <div class="info">
            <p>إذا استمرت هذه الصفحة لأكثر من دقيقة:</p>
            <p style="margin-top: 0.5rem;">
              <code>npm run build</code> قد يحتاج إلى إعادة التشغيل
            </p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
  
  server.listen(PORT, () => {
    console.log(`🚀 Fallback server running on port ${PORT}`);
    console.log(`📍 Visit: http://localhost:${PORT}`);
  });
}
