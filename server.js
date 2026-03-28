#!/usr/bin/env node
const path = require('path');

// Set env
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Try standalone first
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');
const fs = require('fs');

if (fs.existsSync(standalonePath)) {
  // Change working directory to standalone folder
  process.chdir(path.join(__dirname, '.next', 'standalone'));
  // Set the correct port
  process.env.PORT = process.env.PORT || 3000;
  process.env.HOSTNAME = '0.0.0.0';
  require(standalonePath);
} else {
  // Fallback to next start
  const { execSync } = require('child_process');
  execSync(`npx next start -p ${process.env.PORT || 3000}`, {
    stdio: 'inherit',
    env: { ...process.env, HOSTNAME: '0.0.0.0' }
  });
}
