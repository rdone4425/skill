#!/usr/bin/env node
// build:update-count.js — 同步 totalSkills 到所有硬编码位置
// 用法: node build:update-count.js
const fs = require('fs');
const path = require('path');

const repo = __dirname;
const indexJson = JSON.parse(fs.readFileSync(path.join(repo, 'categories/index.json'), 'utf8'));
const count = indexJson.totalSkills;
console.log(`totalSkills = ${count}`);

// 1. index.html meta descriptions
const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
const updated = html.replace(/(\d{4})\+ AI Agent Skills/g, `${count}+ AI Agent Skills`);
fs.writeFileSync(path.join(repo, 'index.html'), updated);

// 2. health-report.json checkedSkills
const report = JSON.parse(fs.readFileSync(path.join(repo, 'categories/health-report.json'), 'utf8'));
if (report.summary.checkedSkills !== count) {
  report.summary.checkedSkills = count;
  fs.writeFileSync(path.join(repo, 'categories/health-report.json'), JSON.stringify(report, null, 2) + '\n');
}

console.log('Done.');
