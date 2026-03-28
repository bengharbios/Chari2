#!/usr/bin/env node
/**
 * TakZone Production Server
 * Compatible with Hostinger Node.js hosting
 */

const path = require('path');
const fs = require('fs');

console.log('🚀 Starting TakZone...');
console.log('📍 Node version:', process.version);
console.log('📍 PORT:', process.env.PORT || 3000);
console.log('📍 NODE_ENV:', process.env.NODE_ENV);

// Set defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 3000;
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

// Check for standalone build
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const standaloneServer = path.join(standaloneDir, 'server.js');

if (fs.existsSync(standaloneServer)) {
  console.log('✅ Found standalone build, using it...');
  
  // Change to standalone directory
  process.chdir(standaloneDir);
  
  // Copy static files
  const staticSrc = path.join(__dirname, '.next', 'static');
  const staticDst = path.join(standaloneDir, '.next', 'static');
  if (fs.existsSync(staticSrc) && !fs.existsSync(staticDst)) {
    try {
      fs.cpSync(staticSrc, staticDst, { recursive: true });
      console.log('✅ Copied static files');
    } catch (e) {
      console.warn('⚠️ Could not copy static files:', e.message);
    }
  }
  
  // Copy public files
  const publicSrc = path.join(__dirname, 'public');
  const publicDst = path.join(standaloneDir, 'public');
  if (fs.existsSync(publicSrc) && !fs.existsSync(publicDst)) {
    try {
      fs.cpSync(publicSrc, publicDst, { recursive: true });
      console.log('✅ Copied public files');
    } catch (e) {
      console.warn('⚠️ Could not copy public files:', e.message);
    }
  }
  
  // Start standalone server
  require(standaloneServer);
} else {
  console.log('⚠️ No standalone build found, using next start...');
  
  // Use next start
  const { spawn } = require('child_process');
  
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
    console.log('Server exited with code:', code);
    process.exit(code || 0);
  });
}
