#!/usr/bin/env node
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const standaloneDir = path.join(__dirname, '.next', 'standalone');

if (fs.existsSync(path.join(standaloneDir, 'server.js'))) {
  process.chdir(standaloneDir);
  require('./server.js');
} else {
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Building...</h1><p>Please wait or redeploy.</p>');
  });
  server.listen(PORT, HOSTNAME, () => {
    console.log(`Fallback server on ${HOSTNAME}:${PORT}`);
  });
}
