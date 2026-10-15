#!/usr/bin/env node
// Quality gate, run in two modes:
//   snapshot  (UserPromptSubmit) records the hash of every uncommitted file in server/ and client/.
//   check     (Stop) finds the files that changed since that snapshot, then builds, lints and tests
//             each side that changed. A failure blocks the stop and hands the errors back to Claude.
// Only files changed during the turn are linted, because existing code doesn't pass the linters yet.

const { spawn, execFileSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_BLOCKS = 3;
const OUTPUT_LIMIT = 4000;
const STATE_DIR = path.join(os.tmpdir(), 'claude-quality-gate');
const MIGRATIONS = 'server/MtgTrader.Infrastructure/Migrations/';

function readStdin() {
  return new Promise((resolve) => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('end', () => resolve(raw.replace(/^﻿/, '')));
  });
}

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex');
}

function hashFile(fullPath) {
  try {
    return sha1(fs.readFileSync(fullPath));
  } catch {
    return 'missing';
  }
}

// Uncommitted files (modified, staged, untracked, deleted) mapped to a hash of their current content.
function dirtyFiles(projectDir) {
  const out = execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '-uall', '--', 'server', 'client'],
    { cwd: projectDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const entries = out.split('\0');
  const files = {};
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    const file = entry.slice(3);
    if (entry[0] === 'R' || entry[0] === 'C') i++; // the next entry is the rename's original path
    files[file] = hashFile(path.join(projectDir, file));
  }
  return files;
}

function changedSince(snapshot, current) {
  const paths = new Set([...Object.keys(snapshot), ...Object.keys(current)]);
  return [...paths].filter((file) => snapshot[file] !== current[file] && !file.endsWith('.md'));
}

function statePath(sessionId) {
  return path.join(STATE_DIR, `${String(sessionId || 'default').replace(/[^\w-]/g, '_')}.json`);
}

function loadState(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(statePath(sessionId), 'utf8'));
  } catch {
    return null;
  }
}

function saveState(sessionId, state) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(statePath(sessionId), JSON.stringify(state));
}

function run(command, args, { cwd, env }) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    child.on('error', (err) => resolve({ ok: false, output: `${command} could not start: ${err.message}` }));
    child.on('close', (code) => resolve({ ok: code === 0, output }));
  });
}

function tail(output) {
  const clean = output.replace(/\x1b\[[0-9;]*m/g, '').trim();
  return clean.length > OUTPUT_LIMIT ? `…${clean.slice(-OUTPUT_LIMIT)}` : clean;
}

function existingFiles(projectDir, changed, prefix, pattern) {
  return changed
    .filter((file) => file.startsWith(prefix) && fs.existsSync(path.join(projectDir, file)))
    .map((file) => file.slice(prefix.length))
    .filter((file) => pattern.test(file));
}

async function checkServer(projectDir, changed) {
  const cwd = path.join(projectDir, 'server');
  // Building into a separate artifacts folder keeps the gate from fighting a running API over locked DLLs.
  const artifacts = path.join(STATE_DIR, `server-artifacts-${sha1(projectDir).slice(0, 8)}`);
  const csFiles = existingFiles(projectDir, changed.filter((file) => !file.startsWith(MIGRATIONS)), 'server/', /\.cs$/);
  const failures = [];
  const ran = ['build', 'tests'];

  const buildAndTest = (async () => {
    const build = await run('dotnet', ['build', 'MtgTrader.sln', '--artifacts-path', artifacts, '-nologo', '-v', 'q', '-clp:ErrorsOnly;NoSummary'], { cwd });
    if (!build.ok) {
      failures.push({ name: 'server build', output: build.output });
      return;
    }
    // DOTNET_ROLL_FORWARD lets the net8.0 test host run on a newer runtime when .NET 8 isn't installed.
    const test = await run('dotnet', ['test', 'MtgTrader.sln', '--no-build', '--artifacts-path', artifacts, '-nologo', '-v', 'q'], { cwd, env: { DOTNET_ROLL_FORWARD: 'Major' } });
    if (!test.ok) failures.push({ name: 'server tests', output: test.output });
  })();

  const lint = (async () => {
    if (!csFiles.length) return;
    ran.push('lint');
    const format = await run('dotnet', ['format', 'MtgTrader.sln', '--verify-no-changes', '-v', 'q', '--include', ...csFiles], { cwd });
    if (!format.ok) {
      failures.push({
        name: 'server lint (dotnet format)',
        hint: `Fix with: cd server; dotnet format MtgTrader.sln --include ${csFiles.join(' ')}`,
        output: format.output,
      });
    }
  })();

  await Promise.all([buildAndTest, lint]);
  return { failures, ran, notes: [] };
}

async function checkClient(projectDir, changed) {
  const cwd = path.join(projectDir, 'client');
  const ng = path.join(cwd, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
  const eslint = path.join(cwd, 'node_modules', 'eslint', 'bin', 'eslint.js');
  if (!fs.existsSync(ng) || !fs.existsSync(eslint)) {
    return { failures: [], ran: [], notes: ['client checks skipped: dependencies are missing, run `npm ci` in client/'] };
  }

  const lintFiles = existingFiles(projectDir, changed, 'client/', /^src\/.*\.(ts|html)$/);
  const env = { NG_CLI_ANALYTICS: 'false' };
  const failures = [];
  const ran = ['build', 'tests'];

  const buildAndTest = (async () => {
    const build = await run(process.execPath, [ng, 'build', '--configuration', 'development'], { cwd, env });
    if (!build.ok) {
      failures.push({ name: 'client build', output: build.output });
      return;
    }
    const test = await run(process.execPath, [ng, 'test', '--watch=false', '--browsers=ChromeHeadless', '--progress=false'], { cwd, env });
    if (!test.ok) failures.push({ name: 'client tests', output: test.output });
  })();

  const lint = (async () => {
    if (!lintFiles.length) return;
    ran.push('lint');
    const result = await run(process.execPath, [eslint, ...lintFiles], { cwd });
    if (!result.ok) {
      failures.push({
        name: 'client lint (eslint)',
        hint: 'Fix the reported problems in the files you changed. `npx eslint --fix <file>` handles the auto-fixable ones.',
        output: result.output,
      });
    }
  })();

  await Promise.all([buildAndTest, lint]);
  return { failures, ran, notes: [] };
}

function respond(payload) {
  if (payload) process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

async function snapshot(input, projectDir) {
  saveState(input.session_id, { files: dirtyFiles(projectDir), blocks: 0 });
  respond();
}

async function check(input, projectDir) {
  const state = loadState(input.session_id) || { files: {}, blocks: 0 };
  const changed = changedSince(state.files, dirtyFiles(projectDir));
  const serverChanged = changed.some((file) => file.startsWith('server/'));
  const clientChanged = changed.some((file) => file.startsWith('client/'));
  if (!serverChanged && !clientChanged) respond();

  const empty = { failures: [], ran: [], notes: [] };
  const [server, client] = await Promise.all([
    serverChanged ? checkServer(projectDir, changed) : empty,
    clientChanged ? checkClient(projectDir, changed) : empty,
  ]);

  const failures = [...server.failures, ...client.failures];
  const notes = [...server.notes, ...client.notes];
  const summary = [
    server.ran.length && `server ${server.ran.join(', ')}`,
    client.ran.length && `client ${client.ran.join(', ')}`,
  ].filter(Boolean).join('; ');

  if (!failures.length) {
    saveState(input.session_id, { ...state, blocks: 0 });
    respond({ systemMessage: [summary && `Quality gate passed (${summary}).`, ...notes].filter(Boolean).join(' ') });
  }

  const blocks = (state.blocks || 0) + 1;
  saveState(input.session_id, { ...state, blocks });
  const names = failures.map((failure) => failure.name).join(', ');
  if (blocks > MAX_BLOCKS) {
    respond({ systemMessage: `Quality gate still failing after ${MAX_BLOCKS} attempts (${names}). Letting Claude stop so you can take a look.` });
  }

  const details = failures.map((failure) =>
    [`## ${failure.name}`, failure.hint, tail(failure.output)].filter(Boolean).join('\n'));
  respond({
    decision: 'block',
    reason: [`Quality gate failed (attempt ${blocks}/${MAX_BLOCKS}): ${names}. Fix these before finishing.`, ...details, ...notes].join('\n\n'),
  });
}

(async () => {
  const mode = process.argv[2];
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch (err) {
    console.error(`quality-gate: could not parse hook input: ${err.message}`);
    process.exit(1);
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();

  if (mode === 'snapshot') await snapshot(input, projectDir);
  else if (mode === 'check') await check(input, projectDir);
  else {
    console.error(`quality-gate: unknown mode "${mode}", expected "snapshot" or "check"`);
    process.exit(1);
  }
})();
