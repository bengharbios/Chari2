#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;
process.env.HOSTNAME = '0.0.0.0';

console.log('🚀 Starting TakZone...');
console.log(`📍 Port: ${process.env.PORT}`);
console.log(`📍 Node: ${process.version}`);

// Start Next.js
const nextProcess = spawn('npx', ['next', 'start'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env,
  shell: true
});

nextProcess.on('error', (err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log(`Server closed with code: ${code}`);
  process.exit(code || 0);
});
