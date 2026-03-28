#!/usr/bin/env node
/**
 * Post-build script for Hostinger deployment
 * Copies static files to standalone directory
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Running post-build script...');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
const staticDir = path.join(__dirname, '..', '.next', 'static');
const publicDir = path.join(__dirname, '..', 'public');

// Copy .next/static to .next/standalone/.next/static
const targetStaticDir = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, targetStaticDir, { recursive: true });
  console.log('✅ Copied .next/static to standalone');
}

// Copy public to .next/standalone/public
const targetPublicDir = path.join(standaloneDir, 'public');
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, targetPublicDir, { recursive: true });
  console.log('✅ Copied public to standalone');
}

// Copy prisma folder if exists
const prismaDir = path.join(__dirname, '..', 'prisma');
const targetPrismaDir = path.join(standaloneDir, 'prisma');
if (fs.existsSync(prismaDir)) {
  fs.cpSync(prismaDir, targetPrismaDir, { recursive: true });
  console.log('✅ Copied prisma to standalone');
}

console.log('🎉 Post-build completed!');
