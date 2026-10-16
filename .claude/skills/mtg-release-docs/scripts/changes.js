#!/usr/bin/env node
// Gathers the facts MtgTrader's PR descriptions, release notes and deployment notes are written from:
// the commit range, its commits with their conventional type normalized, the changed files grouped by
// area, and the deployment signals the docs have to address. It only reads git and the working tree.
//
//   node .claude/skills/mtg-release-docs/scripts/changes.js pr [--base <ref>]
//     the current branch since it left main, uncommitted and untracked work included
//   node .claude/skills/mtg-release-docs/scripts/changes.js release [--from <ref>] [--to <ref>]
//     what the next deploy ships: from the `to` commit recorded in the newest docs/releases/*.md
//     (or --from) up to main (or --to)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const MAIN = 'main';
const RELEASES_DIR = 'docs/releases';
const PR_DIR = 'docs/pull-requests';
const MIGRATIONS = 'server/MtgTrader.Infrastructure/Migrations/';
const SNAPSHOT = `${MIGRATIONS}ApplicationContextModelSnapshot.cs`;
const CONFIG_CONSTANTS = 'server/MtgTrader.Infrastructure/Configuration/ConfigurationConstants.cs';
const CONFIG_EXTENSIONS = 'server/MtgTrader.WebApi/Extensions/ConfigurationExtensions.cs';
const APPSETTINGS = 'server/MtgTrader.WebApi/appsettings.json';
const APP_CONTEXT = 'server/MtgTrader.Infrastructure/Contexts/ApplicationContext.cs';
const LOCKFILE = 'client/package-lock.json';
const SERVICES_EXTENSIONS = 'server/MtgTrader.WebApi/Extensions/ServicesExtensions.cs';
const HUB = 'server/MtgTrader.WebApi/Hubs/ChatHub.cs';
const HUB_PROXY = 'client/src/app/features/trade/services/chat/chathub.proxy.ts';
const EXCERPT_LINES = 40;
const NEW_FILE_EXCERPT_LINES = 12;
// Added server lines that may change how rows written before the deploy are read: normalization,
// hashing, encodings, time kinds, the doubles-list id.
const DATA_READ = /\b(ToLower(?:Invariant)?|ToUpper(?:Invariant)?|Trim(?:Start|End)?|Normalize|Hash|Verify|IsHashed|Encoding\.\w+|ToUniversalTime|SpecifyKind)\b|_doubles/;
const DATA_READ_FILES = /^server\/MtgTrader\.(Core\/Handlers|Infrastructure\/Repositories|Infrastructure\/Services)\//;
// Large generated files that say nothing a reader needs; they are still listed, just not diffed.
const NOT_DIFFED = [':(exclude,glob)**/package-lock.json', ':(exclude,glob)**/*.Designer.cs', `:(exclude)${SNAPSHOT}`];

const TYPES = {
  feat: 'feat', feature: 'feat', fix: 'fix', hotfix: 'fix', refactor: 'refactor', refacto: 'refactor',
  perf: 'perf', chore: 'chore', chores: 'chore', clean: 'chore', docs: 'docs', doc: 'docs',
  test: 'test', tests: 'test', ci: 'ci', build: 'build', style: 'style', revert: 'revert',
};

// A file can carry several tags. The deploy signals below are built from them.
const TAGS = [
  ['migration', (f) => f.startsWith(MIGRATIONS)],
  ['model', (f) => f.startsWith('server/MtgTrader.Core/Entities/General/')
    || f === 'server/MtgTrader.Infrastructure/Contexts/ApplicationContext.cs'],
  ['contract-server', (f) => /^server\/MtgTrader\.(Core\/Entities\/Business|WebApi\/Controllers|WebApi\/Hubs)\//.test(f)],
  ['contract-client', (f) => /^client\/src\/app\/.*\/(models|services)\/.*\.ts$/.test(f) && !f.endsWith('.spec.ts')],
  ['config', (f) => f.startsWith('server/MtgTrader.Infrastructure/Configuration/')
    || /^server\/MtgTrader\.WebApi\/appsettings[^/]*\.json$/.test(f)
    || f === 'server/MtgTrader.WebApi/Extensions/ConfigurationExtensions.cs'
    || f === 'server/MtgTrader.WebApi/Properties/launchSettings.json'
    || f.startsWith('client/src/environments/')
    || f === 'client/src/proxy.conf.json'],
  ['security', (f) => (f === 'server/MtgTrader.Infrastructure/Services/JwtTokenService.cs'
    || /^server\/MtgTrader\.(Core|Infrastructure)\/.*PasswordHasher\.cs$/.test(f)
    || f.startsWith('client/src/app/core/interceptors/')) && !f.endsWith('.spec.ts')],
  ['deploy', (f) => f === 'render.yaml'
    || /^docker-compose[^/]*\.ya?ml$/.test(f)
    || /(^|\/)Dockerfile[^/]*$/.test(f)
    || /(^|\/)\.dockerignore$/.test(f)
    || (f.startsWith('client/nginx/') && !f.startsWith('client/nginx/ssl/'))
    || f === 'client/src/environments/environment.render.ts'
    || f === 'client/angular.json'
    || f.startsWith('.github/workflows/')],
  ['deps', (f) => f === 'client/package.json' || f === 'client/package-lock.json' || /^server\/.*\.csproj$/.test(f)],
  ['protected', (f) => f === 'database/database.sql' || f.startsWith('client/nginx/ssl/') || f.startsWith('server/ssl/')],
  ['test', (f) => f.startsWith('server/MtgTrader.Tests/') || f.endsWith('.spec.ts')],
  ['ui', (f) => /^client\/src\/(app\/.*\.(html|scss)|app\/.*\.component\.ts|styles\.scss|index\.html|assets\/)/.test(f)
    && !f.endsWith('.spec.ts')],
  ['tooling', (f) => f.startsWith('.claude/') || /(^|\/)CLAUDE\.md$/.test(f)],
  ['docs', (f) => f.startsWith('docs/') || (f.endsWith('.md') && !f.startsWith('.claude/') && !/(^|\/)CLAUDE\.md$/.test(f))],
];

function fail(message, code = 1) {
  console.error(`changes.js: ${message}`);
  process.exit(code);
}

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', ['-c', 'core.quotepath=off', ...args], {
      cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    }).replace(/\s+$/, '');
  } catch (err) {
    if (allowFail) return null;
    return fail(`git ${args.join(' ')} failed: ${String(err.stderr || err.message).trim()}`);
  }
}

function gitLines(args, options) {
  const out = git(args, options);
  return out ? out.split('\n').map((line) => line.replace(/\r$/, '')).filter(Boolean) : [];
}

function parseArgs(argv) {
  const [mode, ...rest] = argv;
  if (mode !== 'pr' && mode !== 'release') {
    fail('usage: changes.js pr [--base <ref>] | release [--from <ref>] [--to <ref>]');
  }
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const match = rest[i].match(/^--(base|from|to)$/);
    if (!match || rest[i + 1] === undefined) fail(`unexpected argument "${rest[i]}"`);
    opts[match[1]] = rest[++i];
  }
  return { mode, opts };
}

function resolveRef(ref) {
  return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFail: true }) || fail(`unknown ref "${ref}"`);
}

const short = (sha) => sha.slice(0, 7);

function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function repoUrl() {
  const url = git(['remote', 'get-url', 'origin'], { allowFail: true });
  const match = url && url.match(/github\.com[:/](.+?)(?:\.git)?\/?$/);
  return match ? `https://github.com/${match[1]}` : null;
}

function readFrontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values = {};
  if (!block) return values;
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*?)\s*$/);
    if (kv) values[kv[1]] = kv[2];
  }
  return values;
}

// Release files are named <date>.md, then <date>-2.md, <date>-3.md for later releases the same day.
function releaseFiles() {
  const dir = path.join(REPO_ROOT, RELEASES_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((name) => ({ name, match: name.match(/^(\d{4}-\d{2}-\d{2})(?:-(\d+))?\.md$/) }))
    .filter(({ match }) => match)
    .map(({ name, match }) => {
      const file = `${RELEASES_DIR}/${name}`;
      const meta = readFrontmatter(fs.readFileSync(path.join(REPO_ROOT, file), 'utf8'));
      const committed = gitLines(['status', '--porcelain', '--', file]).length === 0;
      return { file, date: match[1], n: Number(match[2] || 1), from: meta.from, to: meta.to, committed };
    })
    .sort((a, b) => (a.date === b.date ? a.n - b.n : a.date.localeCompare(b.date)));
}

function nextReleasePath(date) {
  let candidate = `${RELEASES_DIR}/${date}.md`;
  for (let n = 2; fs.existsSync(path.join(REPO_ROOT, candidate)); n++) candidate = `${RELEASES_DIR}/${date}-${n}.md`;
  return candidate;
}

function parseSubject(subject) {
  if (/^bump\s/i.test(subject)) return { type: 'deps', scope: null, text: subject };
  const match = subject.match(/^([a-z]+)(?:\(([^)]*)\))?!?\s*:?\s*(.+)$/i);
  const type = match && TYPES[match[1].toLowerCase()];
  if (!type) return { type: 'other', scope: null, text: subject };
  return { type, scope: match[2] || null, text: match[3] };
}

function areaOf(file) {
  if (file.startsWith('server/')) return 'server';
  if (file.startsWith('client/')) return 'client';
  return 'repo';
}

function isReleaseDoc(file) {
  return file === 'CHANGELOG.md' || file.startsWith(`${RELEASES_DIR}/`) || file.startsWith(`${PR_DIR}/`);
}

function readCommits(range) {
  const out = git(['log', '--reverse', '--no-merges', '--date=short', '--name-only',
    '--format=%x1e%H%x1f%ad%x1f%an%x1f%s', range]);
  return out.split('\x1e').filter((chunk) => chunk.trim()).map((chunk) => {
    const [header, ...rest] = chunk.split('\n');
    const [sha, date, author, subject] = header.split('\x1f');
    const files = rest.map((f) => f.trim()).filter(Boolean);
    return {
      sha, date, author, subject, files,
      areas: [...new Set(files.map(areaOf))],
      releaseDocsOnly: files.length > 0 && files.every(isReleaseDoc),
      ...parseSubject(subject),
    };
  });
}

function readMerges(range) {
  return gitLines(['log', '--merges', '--format=%H%x1f%s', range]).map((line) => {
    const [sha, subject] = line.split('\x1f');
    const pr = subject.match(/#(\d+)/);
    return { sha, subject, pr: pr ? pr[1] : null };
  });
}

// ctx.to === null means "the working tree" (pr mode).
function readFiles(ctx) {
  const args = ['diff', '--name-status', '-M', ctx.from, ...(ctx.to ? [ctx.to] : [])];
  const files = gitLines(args).map((line) => {
    const parts = line.split('\t');
    return { status: parts[0][0], path: parts[parts.length - 1], renamedFrom: parts.length > 2 ? parts[1] : null };
  });
  if (!ctx.to) {
    for (const p of gitLines(['ls-files', '--others', '--exclude-standard'])) files.push({ status: 'A', path: p, untracked: true });
  }
  for (const file of files) {
    file.area = areaOf(file.path);
    file.tags = TAGS.filter(([, test]) => test(file.path)).map(([tag]) => tag);
  }
  return files;
}

// One -U0 diff for the whole range, split per file, so each signal can look at added and removed lines.
// Whitespace-only changes are left out: they never matter to a deploy and drown the lines that do.
function readDiffs(ctx, files) {
  const diffs = {};
  const out = git(['diff', '-U0', '-w', '--no-color', '-M', ctx.from, ...(ctx.to ? [ctx.to] : []), '--', '.', ...NOT_DIFFED]);
  for (const chunk of out.split(/^diff --git /m).slice(1)) {
    const plus = chunk.match(/^\+\+\+ b\/(.+)$/m);
    const minus = chunk.match(/^--- a\/(.+)$/m);
    const header = chunk.match(/^a\/.+? b\/(.+)$/m);
    const file = (plus && plus[1]) || (minus && minus[1]) || (header && header[1]);
    if (file) diffs[file.trim()] = chunk;
  }
  for (const file of files.filter((f) => f.untracked)) {
    try {
      const text = fs.readFileSync(path.join(REPO_ROOT, file.path), 'utf8');
      diffs[file.path] = text.split(/\r?\n/).map((line) => `+${line}`).join('\n');
    } catch {
      // Unreadable (binary or vanished): it is still listed, just not diffed.
    }
  }
  return diffs;
}

function changedLines(diff, sign) {
  if (!diff) return [];
  return diff.split('\n').filter((line) => line[0] === sign && !line.startsWith(`${sign}${sign}${sign} `)).map((line) => line.slice(1));
}

function excerpt(diff, isNew) {
  if (!diff) return [];
  const lines = diff.split('\n').filter((line) => /^[+-]/.test(line) && !/^(\+\+\+|---) /.test(line));
  const kept = lines.slice(0, isNew ? NEW_FILE_EXCERPT_LINES : EXCERPT_LINES);
  if (lines.length > kept.length) kept.push(`… ${lines.length - kept.length} more ${isNew ? 'lines in this new file' : 'changed lines'}`);
  return kept;
}

// Pairs each `EnvX = "ENV_NAME"` constant with its `X = "Section:Key"` sibling in the same class.
function settingPairs(constantsText) {
  const pairs = new Map();
  for (const cls of constantsText.split(/\bclass\s+/).slice(1)) {
    const consts = {};
    for (const m of cls.matchAll(/const\s+string\s+(\w+)\s*=\s*"([^"]+)"/g)) consts[m[1]] = m[2];
    for (const [name, value] of Object.entries(consts)) {
      if (name.startsWith('Env') && consts[name.slice(3)]) pairs.set(value, consts[name.slice(3)]);
    }
  }
  return pairs;
}

// appsettings keys as `section:key`, lower-cased because .NET configuration keys are case-insensitive.
function settingKeys(text) {
  const keys = new Set();
  const walk = (obj, prefix) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}:${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
      else keys.add(key.toLowerCase());
    }
  };
  try {
    walk(JSON.parse(text.replace(/^﻿/, '')), '');
  } catch {
    // An unreadable file has no defaults, as far as this check goes.
  }
  return keys;
}

function entityNames(text) {
  return new Set([...text.matchAll(/(?:DbSet|Entity)<(\w+)>/g)].map((m) => m[1]));
}

function lockChanges(fromRef, toRef) {
  const parse = (text) => {
    try {
      const packages = JSON.parse(text.replace(/^﻿/, '')).packages || {};
      delete packages[''];
      return packages;
    } catch {
      return {};
    }
  };
  const before = parse(contentAt(fromRef, LOCKFILE));
  const after = parse(contentAt(toRef, LOCKFILE));
  const name = (p) => p.replace(/^.*node_modules\//, '');
  const runtime = (entry) => entry && !entry.dev && !entry.devOptional;
  const result = { added: 0, removed: 0, bumped: 0, runtime: [] };
  for (const [p, entry] of Object.entries(after)) {
    const old = before[p];
    if (!old) {
      result.added++;
      if (runtime(entry)) result.runtime.push(`added ${name(p)} ${entry.version}`);
    } else if (old.version !== entry.version) {
      result.bumped++;
      if (runtime(entry) || runtime(old)) result.runtime.push(`${name(p)} ${old.version} → ${entry.version}`);
    }
  }
  for (const [p, old] of Object.entries(before)) {
    if (after[p]) continue;
    result.removed++;
    if (runtime(old)) result.runtime.push(`removed ${name(p)}`);
  }
  return result;
}

function contentAt(ref, file) {
  if (!ref) {
    try {
      return fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
    } catch {
      return '';
    }
  }
  return git(['show', `${ref}:${file}`], { allowFail: true }) || '';
}

function migrationsAt(ref) {
  const dir = MIGRATIONS.replace(/\/$/, '');
  let names;
  if (ref) names = gitLines(['ls-tree', '--name-only', `${ref}:${dir}`], { allowFail: true });
  else names = fs.existsSync(path.join(REPO_ROOT, dir)) ? fs.readdirSync(path.join(REPO_ROOT, dir)) : [];
  return names
    .map((name) => name.match(/^(\d{14})_(\w+)\.cs$/))
    .filter(Boolean)
    .map((match) => ({ id: `${match[1]}_${match[2]}`, name: match[2] }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

// The feature a file belongs to, and the component or service inside it, so smoke tests and
// screenshots can name screens rather than files.
function featureOf(file) {
  const rules = [
    [/^server\/MtgTrader\.Core\/Handlers\/(\w+)\//, (m) => [`server ${m[1]}`]],
    [/^server\/MtgTrader\.WebApi\/Controllers\/(\w+)Controller\.cs$/, (m) => [`server ${m[1]}`]],
    [/^server\/MtgTrader\.Infrastructure\/Repositories\/(?!Base)(\w+?)Repository\.cs$/, (m) => [`server ${m[1]}`]],
    [/^server\/MtgTrader\.WebApi\/Hubs\//, () => ['server Chat']],
    [/^client\/src\/app\/features\/(\w+)\/(?:components|services)\/([\w-]+)\//, (m) => [`client ${m[1]}`, m[2]]],
    [/^client\/src\/app\/features\/(\w+)\//, (m) => [`client ${m[1]}`]],
    [/^client\/src\/app\/core\/(?:services|components|interceptors)\/([\w-]+)/, (m) => ['client core', m[1]]],
    [/^client\/src\/app\/app\.component\./, () => ['client app shell']],
  ];
  for (const [re, label] of rules) {
    const match = file.match(re);
    if (match) return label(match);
  }
  return null;
}

function describeFeatures(paths) {
  const features = new Map();
  for (const p of paths) {
    const feature = featureOf(p);
    if (!feature) continue;
    const [key, detail] = feature;
    if (!features.has(key)) features.set(key, new Set());
    if (detail) features.get(key).add(detail);
  }
  return [...features].map(([key, details]) => (details.size ? `${key} (${[...details].join(', ')})` : key)).join(' · ');
}

function packageChanges(fromRef, toRef, file) {
  const parse = (text) => {
    try {
      const json = JSON.parse(text.replace(/^﻿/, ''));
      const dev = Object.fromEntries(Object.entries(json.devDependencies || {}).map(([name, v]) => [`${name} (dev)`, v]));
      return { ...json.dependencies, ...dev };
    } catch {
      return {};
    }
  };
  return diffVersions(parse(contentAt(fromRef, file)), parse(contentAt(toRef, file)));
}

function csprojChanges(fromRef, toRef, file) {
  const parse = (text) => {
    const refs = {};
    for (const match of text.matchAll(/<PackageReference\s+Include="([^"]+)"(?:\s+Version="([^"]*)")?/g)) refs[match[1]] = match[2] || '';
    const tfm = text.match(/<TargetFrameworks?>([^<]+)</);
    if (tfm) refs['(target framework)'] = tfm[1];
    return refs;
  };
  return diffVersions(parse(contentAt(fromRef, file)), parse(contentAt(toRef, file)));
}

function diffVersions(before, after) {
  const changes = [];
  for (const [name, version] of Object.entries(after)) {
    if (!(name in before)) changes.push(`added ${name} ${version}`);
    else if (before[name] !== version) changes.push(`${name} ${before[name]} → ${version}`);
  }
  for (const name of Object.keys(before)) if (!(name in after)) changes.push(`removed ${name}`);
  return changes;
}

function collectSignals(ctx, files, diffs) {
  const byTag = (tag) => files.filter((f) => f.tags.includes(tag));
  const has = (p) => files.some((f) => f.path === p);
  const signals = [];
  const add = (title, lines, paths = []) => signals.push({ title, lines, paths });

  // Migrations
  const migrationFiles = byTag('migration');
  const newMigrations = migrationFiles
    .filter((f) => f.status === 'A')
    .map((f) => f.path.slice(MIGRATIONS.length).match(/^(\d{14})_(\w+)\.cs$/))
    .filter(Boolean)
    .map((match) => `${match[1]}_${match[2]}`);
  const newIds = new Set(newMigrations);
  const edited = migrationFiles.filter((f) => f.path !== SNAPSHOT && f.status !== 'A'
    && ![...newIds].some((id) => f.path.slice(MIGRATIONS.length).startsWith(id)));
  if (newMigrations.length) {
    const all = migrationsAt(ctx.to);
    const lines = newMigrations.map((id) => {
      const index = all.findIndex((m) => m.id === id);
      const previous = index > 0 ? all[index - 1].name : '0';
      return `new ${id}. SQL: node .claude/skills/mtg-schema-change/scripts/ef.js migrations script ${previous} ${id.split('_').slice(1).join('_')}`;
    });
    if (ctx.to && ctx.headSha !== ctx.to) {
      lines.push(`the working tree is not at ${short(ctx.to)}: read Up/Down with \`git show ${short(ctx.to)}:<migration file>\` instead of running ef`);
    }
    add('Migrations (applied automatically when the API starts)', lines);
  }
  // Only files EF maps count as the model: Entities/General also holds plain records.
  const entities = new Set([...entityNames(contentAt(ctx.from, APP_CONTEXT)), ...entityNames(contentAt(ctx.to, APP_CONTEXT))]);
  const modelFiles = byTag('model').filter((f) => f.path === APP_CONTEXT || entities.has(path.basename(f.path, '.cs')));
  if (modelFiles.length && !newMigrations.length) {
    add('Model changed without a new migration', [
      'EF entities or ApplicationContext changed but no migration was added. Confirm with: node .claude/skills/mtg-schema-change/scripts/ef.js migrations has-pending-model-changes',
    ], modelFiles.map((f) => f.path));
  }

  // Settings: new or removed environment variables, and appsettings.json defaults that were removed,
  // which leave every environment that relied on them without a value.
  const pairsFrom = settingPairs(contentAt(ctx.from, CONFIG_CONSTANTS));
  const pairsTo = settingPairs(contentAt(ctx.to, CONFIG_CONSTANTS));
  const keysFrom = settingKeys(contentAt(ctx.from, APPSETTINGS));
  const keysTo = settingKeys(contentAt(ctx.to, APPSETTINGS));
  const compose = contentAt(ctx.to, 'docker-compose.yml');
  const render = contentAt(ctx.to, 'render.yaml');
  const sets = (text, env) => new RegExp(`\\b${env}\\b`).test(text);
  const watched = new Map();
  for (const env of pairsTo.keys()) if (!pairsFrom.has(env)) watched.set(env, 'new variable');
  for (const [env, key] of pairsTo) {
    if (keysFrom.has(key.toLowerCase()) && !keysTo.has(key.toLowerCase())) watched.set(env, `its appsettings.json default (${key}) was removed`);
  }
  for (const file of files.filter((f) => f.area === 'server' && f.path.endsWith('.cs') && !f.tags.includes('test'))) {
    for (const line of changedLines(diffs[file.path], '+')) {
      for (const m of line.matchAll(/GetEnvironmentVariable\(\s*"([A-Za-z0-9_]+)"/g)) {
        if (!watched.has(m[1]) && !pairsFrom.has(m[1])) watched.set(m[1], 'newly read with GetEnvironmentVariable');
      }
    }
  }
  const envLines = [];
  for (const [env, reason] of watched) {
    const key = pairsTo.get(env);
    const hasDefault = Boolean(key && keysTo.has(key.toLowerCase()));
    const verdict = !hasDefault && !sets(render, env)
      ? '. No default and not in render.yaml: unless it is set in the Render dashboard, the API gets no value there'
      : '';
    envLines.push(`${env}${key ? ` (${key})` : ''}: ${reason}. appsettings.json default: ${hasDefault ? 'yes' : 'none'} · docker-compose.yml: ${sets(compose, env) ? 'sets it' : 'not set'} · render.yaml: ${sets(render, env) ? 'sets it' : 'not set'}${verdict}`);
  }
  for (const env of pairsFrom.keys()) if (!pairsTo.has(env)) envLines.push(`${env}: removed from the code. Remove it from the Render dashboard and docker-compose.yml if set there`);
  if (changedLines(diffs[CONFIG_EXTENSIONS], '+').some((line) => /\bthrow\b/.test(line))) {
    envLines.push('ConfigurationExtensions.cs adds a `throw` at startup: a missing setting now stops the API (see its excerpt under Configuration files)');
  }
  if (envLines.length) add('Environment variables and required settings', envLines);

  const configFiles = byTag('config');
  if (configFiles.length) add('Configuration files', [], configFiles.map((f) => f.path));

  // Security: ServicesExtensions also holds DI, so it only counts when the diff touches auth or CORS.
  const security = byTag('security').map((f) => f.path);
  if (has(SERVICES_EXTENSIONS) && /cors|jwt|token|authenticat|authoriz/i.test(changedLines(diffs[SERVICES_EXTENSIONS], '+').concat(changedLines(diffs[SERVICES_EXTENSIONS], '-')).join('\n'))) {
    security.push(SERVICES_EXTENSIONS);
  }
  if (security.length) add('Security: JWT, CORS or the auth interceptor (Ask first)', [], security);

  // API contracts
  const serverContract = byTag('contract-server').map((f) => f.path);
  const clientContract = byTag('contract-client').map((f) => f.path);
  if (serverContract.length || clientContract.length) {
    const lines = [];
    if (serverContract.length && !clientContract.length) lines.push('server side changed, no client model or service changed: check whether the client already matches');
    if (has(HUB) !== has(HUB_PROXY)) lines.push(`only one side of the chat hub changed (${has(HUB) ? 'ChatHub.cs' : 'chathub.proxy.ts'}): names and payloads match by string, so check whether the other side already matches`);
    add('API contract (server records, controllers, hub / client models, services)', lines, [...serverContract, ...clientContract]);
  }

  // Deployment files
  const deployFiles = byTag('deploy');
  if (deployFiles.length) add('Deployment files (Ask first)', [], deployFiles.map((f) => f.path));

  // Dependencies
  const depLines = [];
  for (const file of byTag('deps')) {
    if (file.path.endsWith('package.json')) depLines.push(...packageChanges(ctx.from, ctx.to, file.path).map((c) => `npm: ${c}`));
    else if (file.path.endsWith('.csproj')) depLines.push(...csprojChanges(ctx.from, ctx.to, file.path).map((c) => `${path.basename(file.path)}: ${c}`));
  }
  if (has(LOCKFILE)) {
    const lock = lockChanges(ctx.from, ctx.to);
    const runtime = lock.runtime.length
      ? `${lock.runtime.slice(0, 15).join(', ')}${lock.runtime.length > 15 ? `, … ${lock.runtime.length - 15} more` : ''}`
      : 'none';
    depLines.push(`package-lock.json${has('client/package.json') ? '' : ' (changed without package.json: npm update or audit fix?)'}: +${lock.added} / -${lock.removed} packages, ${lock.bumped} version bumps; runtime (non-dev) packages changed: ${runtime}`);
  }
  if (byTag('deps').length) add('Dependencies (a new package is Ask first)', depLines.length ? depLines : ['manifest changed, no package version changed']);

  // Protected files
  const protectedFiles = [...byTag('protected'), ...edited].map((f) => f.path);
  if (protectedFiles.length) add('"Leave alone" files changed (blocker)', [], protectedFiles);

  // A heuristic, not a finding: lines that may change how rows written before the deploy are read.
  const dataLines = [];
  for (const file of files.filter((f) => DATA_READ_FILES.test(f.path) && f.path.endsWith('.cs') && !f.tags.includes('test'))) {
    const hits = changedLines(diffs[file.path], '+').filter((line) => DATA_READ.test(line)).map((line) => line.trim());
    dataLines.push(...hits.slice(0, 3).map((line) => `${path.basename(file.path)}: ${line}`));
    if (hits.length > 3) dataLines.push(`${path.basename(file.path)}: … ${hits.length - 3} more`);
  }
  if (dataLines.length) {
    add('Stored data possibly read differently (heuristic: normalization, hashing, encoding, time, doubles id)', [
      ...dataLines.slice(0, 15), ...(dataLines.length > 15 ? [`… ${dataLines.length - 15} more`] : []),
    ]);
  }

  return signals;
}

function main() {
  const { mode, opts } = parseArgs(process.argv.slice(2));
  const headSha = resolveRef('HEAD');
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const url = repoUrl();
  const out = [];
  let ctx;
  let docPath;
  let docNote;

  if (mode === 'pr') {
    if (branch === MAIN && !opts.base) fail(`on ${MAIN}: a PR comes from a feature branch. Use "release", or pass --base <ref>.`);
    const from = opts.base ? resolveRef(opts.base) : git(['merge-base', MAIN, 'HEAD']);
    ctx = { from, to: null, headSha };
    docPath = `${PR_DIR}/${branch.replace(/[^\w.-]+/g, '-')}.md`;
    docNote = fs.existsSync(path.join(REPO_ROOT, docPath)) ? 'exists: keep what a human added' : 'new';
    out.push(`# PR: ${branch} → ${MAIN}`);
    out.push(`Range: ${short(from)}..HEAD plus uncommitted work (${opts.base ? `--base ${opts.base}` : `base = merge-base with ${MAIN}`})`);
  } else {
    const releases = releaseFiles();
    const newest = releases[releases.length - 1];
    let from = opts.from;
    let how = '--from';
    if (!from && newest && !newest.committed && newest.from) {
      from = newest.from;
      how = `${newest.file} is not committed yet, so it is regenerated from its own \`from\``;
      docPath = newest.file;
    } else if (!from && newest && newest.to) {
      from = newest.to;
      how = `\`to\` of ${newest.file}`;
    }
    if (!from) {
      fail([
        `no release recorded in ${RELEASES_DIR}/ yet, so there is no starting point.`,
        'Pass --from <ref>: the commit currently live on Render, or the first commit the notes should cover.',
        `Recent ${MAIN} commits:`,
        ...gitLines(['log', '--format=  %h %ad %s', '--date=short', '-15', MAIN]),
      ].join('\n'), 2);
    }
    const fromSha = resolveRef(from);
    const toSha = resolveRef(opts.to || MAIN);
    if (git(['merge-base', '--is-ancestor', fromSha, toSha], { allowFail: true }) === null) {
      fail(`${short(fromSha)} is not an ancestor of ${short(toSha)}: pick a --from on ${opts.to || MAIN}'s history`);
    }
    ctx = { from: fromSha, to: toSha, headSha };
    docPath = docPath || nextReleasePath(today());
    docNote = fs.existsSync(path.join(REPO_ROOT, docPath)) ? 'exists: regenerate it, keep what a human added' : 'new';
    out.push(`# Release: ${short(fromSha)}..${short(toSha)} (${opts.to || MAIN})`);
    out.push(`Range: from ${how}; full shas for the frontmatter: from: ${fromSha} · to: ${toSha}`);
    const remoteAhead = git(['rev-list', '--count', `${toSha}..origin/${MAIN}`], { allowFail: true });
    if (!opts.to && remoteAhead && remoteAhead !== '0') out.push(`Warning: origin/${MAIN} (as of the last fetch) has ${remoteAhead} commit(s) that local ${MAIN} doesn't. Pull first if they should be included.`);
  }

  const range = `${ctx.from}..${ctx.to || 'HEAD'}`;
  const commits = readCommits(range);
  const merges = readMerges(range);
  // The PR doc is this skill's own output, not part of the change it describes.
  const isOwnDoc = (p) => mode === 'pr' && p === docPath;
  const files = readFiles(ctx).filter((f) => !isOwnDoc(f.path));
  const diffs = readDiffs(ctx, files);
  const uncommitted = mode === 'pr' ? gitLines(['status', '--porcelain=v1', '-uall']).filter((line) => !isOwnDoc(line.slice(3))) : [];

  if (!commits.length && !files.length) {
    out.push('', 'Nothing changed in this range.');
    console.log(out.join('\n'));
    return;
  }

  const count = (area) => files.filter((f) => f.area === area).length;
  out.push(`Commits: ${commits.length} · Files: ${files.length} (server ${count('server')}, client ${count('client')}, repo ${count('repo')})`);
  out.push(`Date: ${today()} · Doc file: ${docPath} (${docNote})`);
  if (mode === 'release') out.push(`CHANGELOG.md: ${fs.existsSync(path.join(REPO_ROOT, 'CHANGELOG.md')) ? 'exists' : 'missing: create it'}`);
  if (url) {
    out.push(mode === 'pr'
      ? `Compare / open PR: ${url}/compare/${MAIN}...${branch}?expand=1`
      : `Compare: ${url}/compare/${short(ctx.from)}...${short(ctx.to)} · commit links: ${url}/commit/<sha>`);
  }
  if (mode === 'pr') {
    const upstream = git(['rev-parse', '--verify', '--quiet', `origin/${branch}`], { allowFail: true });
    if (!upstream) out.push(`Push: ${branch} is not on origin yet (pushing is Ask first)`);
    else {
      const ahead = git(['rev-list', '--count', `origin/${branch}..HEAD`]);
      out.push(ahead === '0' ? `Push: up to date with origin/${branch} (as of the last fetch)` : `Push: ${ahead} local commit(s) not on origin/${branch}`);
    }
    if (uncommitted.length) {
      out.push(`Uncommitted (not in the PR until committed): ${uncommitted.length} file(s)`);
      for (const line of uncommitted) out.push(`  ${line}`);
    }
  }

  out.push('', '## Commits (oldest first)');
  for (const c of commits) {
    const skip = c.releaseDocsOnly ? ' (release docs only: leave out of the notes)' : '';
    out.push(`- ${short(c.sha)} ${c.date} ${c.type}${c.scope ? `(${c.scope})` : ''}: ${c.text} [${c.areas.join(', ') || 'no files'}]${skip}`);
  }
  const typeCounts = {};
  for (const c of commits) typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
  out.push(`Types: ${Object.entries(typeCounts).map(([t, n]) => `${t} ${n}`).join(' · ') || 'none'}`);
  const unconventional = commits.filter((c) => c.type === 'other');
  if (unconventional.length) out.push(`Unconventional subjects (classify from the diff): ${unconventional.map((c) => short(c.sha)).join(', ')}`);
  if (merges.length) {
    out.push('Merges:');
    for (const m of merges) out.push(`- ${short(m.sha)} ${m.subject}${m.pr ? ` (PR #${m.pr})` : ''}`);
  }
  const prDocs = files.filter((f) => f.path.startsWith(`${PR_DIR}/`) && f.status !== 'D').map((f) => f.path);
  if (mode === 'release' && prDocs.length) out.push(`PR docs in range (read them for intent and deploy steps): ${prDocs.join(', ')}`);

  out.push('', '## Files');
  for (const area of ['server', 'client', 'repo']) {
    const inArea = files.filter((f) => f.area === area);
    if (!inArea.length) continue;
    out.push(`### ${area} (${inArea.length})`);
    for (const f of inArea) {
      const flags = [...f.tags, ...(f.untracked ? ['untracked'] : [])];
      out.push(`- ${f.status} ${f.renamedFrom ? `${f.renamedFrom} → ` : ''}${f.path}${flags.length ? ` [${flags.join(', ')}]` : ''}`);
    }
  }

  const runtime = files.filter((f) => (f.area === 'server' || f.area === 'client') && !f.tags.includes('test') && !f.path.endsWith('.md'));
  const clientRuntime = runtime.filter((f) => f.area === 'client');
  const tests = files.filter((f) => f.tags.includes('test'));
  const features = describeFeatures(runtime.map((f) => f.path));
  const ui = describeFeatures(files.filter((f) => f.tags.includes('ui')).map((f) => f.path));

  out.push('', '## Deploy signals');
  const signals = collectSignals(ctx, files, diffs);
  const checked = ['migrations', 'environment variables', 'configuration', 'security', 'API contract', 'deployment files', 'dependencies', '"Leave alone" files'];
  if (!signals.length) out.push(`None. Checked: ${checked.join(', ')}.`);
  for (const s of signals) {
    out.push(`### ${s.title}`);
    for (const line of s.lines) out.push(`- ${line}`);
    for (const p of s.paths) {
      out.push(`- ${p}`);
      if (/\.(json|ya?ml|conf|ts|cs|csproj)$/.test(p) || /Dockerfile/.test(p)) {
        const file = files.find((f) => f.path === p);
        const lines = excerpt(diffs[p], file && file.status === 'A');
        if (lines.length) out.push('  ```diff', ...lines.map((l) => `  ${l}`), '  ```');
      }
    }
  }

  out.push('', '## Context for the docs');
  out.push(`Runtime code changed: ${runtime.length ? `yes (${runtime.length} files)` : 'no: tooling, docs or tests only'}`);
  out.push(`Features touched (for smoke tests): ${features || 'none'}`);
  out.push(`UI touched (screenshots): ${ui || 'none'}`);
  out.push(`Tests changed: server ${tests.filter((f) => f.area === 'server').length}, client ${tests.filter((f) => f.area === 'client').length}${tests.length ? ` (${tests.map((f) => path.basename(f.path)).join(', ')})` : ''}`);
  if (clientRuntime.length) {
    const modules = fs.existsSync(path.join(REPO_ROOT, 'client', 'node_modules', '@angular', 'cli')) ? 'present' : 'missing';
    out.push(`Client changed: Render builds it with --configuration=render, which CI never runs. Run \`npx ng build --configuration=render\` from client/ (node_modules ${modules}).`);
  }

  console.log(out.join('\n'));
}

main();
