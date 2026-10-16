#!/usr/bin/env node
// Runs `dotnet ef` against MtgTrader's EF Core projects, from any working directory.
//
//   node .claude/skills/mtg-schema-change/scripts/ef.js <dotnet ef arguments>
//     e.g. migrations add AddWantlistCreatedAt
//          migrations has-pending-model-changes
//          migrations script AddMessageDate AddWantlistCreatedAt
//          database update
//   node .claude/skills/mtg-schema-change/scripts/ef.js db-target
//     prints the database the API (and `database update`) would use, and whether it is local and reachable.
//
// The server targets net8.0, but a machine may only have a newer runtime, sometimes outside the default
// install folder. DOTNET_ROLL_FORWARD=Major lets the net8.0 tool run on it, and DOTNET_ROOT tells the
// dotnet-ef launcher where that runtime is. Both are harmless when .NET 8 is installed normally.

const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const SERVER_DIR = path.join(REPO_ROOT, 'server');
const PROJECT_ARGS = ['--project', 'MtgTrader.Infrastructure', '--startup-project', 'MtgTrader.WebApi'];

function findDotnetRoot() {
  const exe = process.platform === 'win32' ? 'dotnet.exe' : 'dotnet';
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, exe);
    if (fs.existsSync(candidate)) return path.dirname(fs.realpathSync(candidate));
  }
  return null;
}

function dotnetEnv() {
  const env = { ...process.env, DOTNET_ROLL_FORWARD: process.env.DOTNET_ROLL_FORWARD || 'Major' };
  if (!env.DOTNET_ROOT) {
    const root = findDotnetRoot();
    if (root) env.DOTNET_ROOT = root;
  }
  return env;
}

function runEf(args) {
  const hasProjectArgs = args.some((arg) => arg === '--project' || arg === '-p' || arg === '--startup-project' || arg === '-s');
  const fullArgs = ['ef', ...args, ...(hasProjectArgs ? [] : PROJECT_ARGS)];
  const child = spawn('dotnet', fullArgs, { cwd: SERVER_DIR, env: dotnetEnv(), stdio: 'inherit' });
  child.on('error', (err) => {
    console.error(`ef.js: could not start dotnet: ${err.message}`);
    process.exit(1);
  });
  child.on('close', (code) => process.exit(code === null ? 1 : code));
}

function readPgSettings() {
  const settings = {};
  for (const file of ['appsettings.json', 'appsettings.Development.json']) {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, 'MtgTrader.WebApi', file), 'utf8').replace(/^﻿/, ''));
      Object.assign(settings, json.PG || {});
    } catch {
      // A missing or unreadable file just contributes nothing, as it does for the API.
    }
  }
  // Same precedence as ConfigurationExtensions.RegisterConfiguration: environment variables win.
  return {
    host: process.env.PG_HOST || settings.Host,
    port: Number(process.env.PG_PORT || settings.Port || 5432),
    database: process.env.PG_DATABASE || settings.Db,
    user: process.env.PG_USER || settings.User,
  };
}

function isReachable(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok) => { socket.destroy(); resolve(ok); };
    socket.setTimeout(2000, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

async function dbTarget() {
  const pg = readPgSettings();
  const local = ['localhost', '127.0.0.1', '::1'].includes(String(pg.host).toLowerCase());
  const reachable = pg.host ? await isReachable(pg.host, pg.port) : false;
  console.log(`host=${pg.host} port=${pg.port} database=${pg.database} user=${pg.user} local=${local ? 'yes' : 'no'} reachable=${reachable ? 'yes' : 'no'}`);
}

const args = process.argv.slice(2);
if (args[0] === 'db-target') dbTarget();
else if (args.length) runEf(args);
else {
  console.error('usage: node ef.js <dotnet ef arguments> | db-target');
  process.exit(1);
}
