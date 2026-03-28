#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'production';

const standalone = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standalone)) {
  require(standalone);
} else {
  require('next/dist/server/lib/start-server').startServer({
    dir: __dirname,
    port: process.env.PORT || 3000
  });
}
