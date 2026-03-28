#!/usr/bin/env node
/**
 * TakZone Production Server
 * Works with Hostinger Node.js hosting
 */

const path = require('path');
const fs = require('fs');

// Set environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('🚀 Starting TakZone...');
console.log(`📍 Port: ${process.env.PORT}`);
console.log(`📍 Node: ${process.version}`);
console.log(`📍 Working Dir: ${__dirname}`);

// Check for standalone build
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('✅ Using standalone server');
  
  // Change to standalone directory
  process.chdir(standaloneDir);
  
  // Copy static and public files if they exist
  const staticSrc = path.join(__dirname, '.next', 'static');
  const staticDst = path.join(standaloneDir, '.next', 'static');
  if (fs.existsSync(staticSrc) && !fs.existsSync(staticDst)) {
    fs.cpSync(staticSrc, staticDst, { recursive: true });
    console.log('✅ Copied static files');
  }
  
  const publicSrc = path.join(__dirname, 'public');
  const publicDst = path.join(standaloneDir, 'public');
  if (fs.existsSync(publicSrc) && !fs.existsSync(publicDst)) {
    fs.cpSync(publicSrc, publicDst, { recursive: true });
    console.log('✅ Copied public files');
  }
  
  // Start standalone server
  require(standaloneServer);
} else {
  console.log('⚠️ Standalone not found, using next start');
  
  // Use child process to run next start
  const { spawn } = require('child_process');
  
  const nextProcess = spawn('npx', ['next', 'start', '-p', process.env.PORT], {
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
    console.log(`Server exited with code: ${code}`);
    process.exit(code || 0);
  });
}
