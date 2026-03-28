#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
const fs = require('fs');

if (fs.existsSync(standalonePath)) {
  process.chdir(path.join(__dirname, '.next', 'standalone'));
  require(standalonePath);
} else {
  const nextProcess = spawn('npx', ['next', 'start'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });
  
  nextProcess.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}
