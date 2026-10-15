#!/usr/bin/env node
// PreToolUse hook: refuses Edit/Write/NotebookEdit on the files CLAUDE.md lists under "Leave alone".
// Shell commands (dotnet ef, npm install) are not affected, so generated files still change the normal way.
// The same list lives in permissions.deny in .claude/settings.json and under "Leave alone" in CLAUDE.md;
// change all three together.

const path = require('path');

const PROTECTED = [
  {
    prefix: 'server/MtgTrader.Infrastructure/Migrations/',
    reason: 'Migrations are generated. For a schema change, add a new one with `dotnet ef migrations add <Name> --project MtgTrader.Infrastructure --startup-project MtgTrader.WebApi`.',
  },
  {
    file: 'database/database.sql',
    reason: 'database/database.sql is a frozen copy of the first migration.',
  },
  {
    prefix: 'client/nginx/ssl/',
    reason: 'client/nginx/ssl/ holds certificates and private keys.',
  },
  {
    prefix: 'server/ssl/',
    reason: 'server/ssl/ holds certificates and private keys.',
  },
  {
    file: 'client/package-lock.json',
    reason: 'client/package-lock.json changes only through npm.',
  },
];

function normalize(p) {
  const slashed = p.split(path.sep).join('/');
  return process.platform === 'win32' ? slashed.toLowerCase() : slashed;
}

function findRule(relPath) {
  const rel = normalize(relPath);
  return PROTECTED.find((rule) =>
    rule.file ? rel === normalize(rule.file) : rel.startsWith(normalize(rule.prefix)));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw.replace(/^﻿/, ''));
  } catch (err) {
    console.error(`protect-files: could not parse hook input: ${err.message}`);
    process.exit(1);
  }

  const toolInput = input.tool_input || {};
  const target = toolInput.file_path || toolInput.notebook_path;
  if (!target) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const absolute = path.resolve(input.cwd || projectDir, target);
  const relative = path.relative(projectDir, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0);

  const rule = findRule(relative);
  if (!rule) process.exit(0);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `${relative.split(path.sep).join('/')} is protected (CLAUDE.md "Leave alone"). ${rule.reason}`,
    },
  }));
  process.exit(0);
});
