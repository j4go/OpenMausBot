#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const renderScript = path.join(scriptDir, 'render_review_board.mjs');
const BOARD_DIR = '.review-board';
const LEGACY_NAMES = [
  'index.html',
  'index.prev.html',
  'review-board.js',
  'review-board-live.js',
  'mermaid.min.js',
];

async function pathExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function isSliceDir(dir) {
  if (await pathExists(path.join(dir, '.workflow-state.json'))) return true;
  const markers = ['clarify.md', 'prd.md', 'project-wiki.md', 'development-plan.md'];
  for (const name of markers) {
    if (await pathExists(path.join(dir, name))) return true;
  }
  return false;
}

export async function listSliceDirs(root) {
  const resolved = path.resolve(root);
  const slices = [];
  if (await isSliceDir(resolved)) slices.push(resolved);
  const candidates = [
    path.join(resolved, 'docs', 'product-development'),
    path.join(resolved, 'product-development'),
  ];
  for (const parent of candidates) {
    let entries = [];
    try {
      entries = await fs.readdir(parent, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(parent, entry.name);
      if (await isSliceDir(dir)) slices.push(dir);
    }
  }
  return [...new Set(slices)];
}

async function moveLegacyBoardFiles(slice) {
  const moved = [];
  const destRoot = path.join(slice, BOARD_DIR, 'legacy');
  for (const name of LEGACY_NAMES) {
    const from = path.join(slice, name);
    if (!(await pathExists(from))) continue;
    await fs.mkdir(destRoot, { recursive: true });
    const to = path.join(destRoot, name);
    if (await pathExists(to)) await fs.rm(to, { recursive: true, force: true });
    await fs.rename(from, to);
    moved.push(name);
  }
  const historyFrom = path.join(slice, 'history');
  if (await pathExists(historyFrom)) {
    await fs.mkdir(destRoot, { recursive: true });
    const historyTo = path.join(destRoot, 'history');
    if (await pathExists(historyTo)) await fs.rm(historyTo, { recursive: true, force: true });
    await fs.rename(historyFrom, historyTo);
    moved.push('history/');
  }
  return moved;
}

function renderSlice(slice) {
  const result = spawnSync(process.execPath, [renderScript, slice], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `render failed (${result.status})`).trim());
  }
}

export async function migrateSlice(slice) {
  const root = path.resolve(slice);
  const board = path.join(root, BOARD_DIR, 'index.html');
  const hadBoard = await pathExists(board);
  const moved = await moveLegacyBoardFiles(root);
  if (!hadBoard || moved.length) renderSlice(root);
  else if (!(await pathExists(board))) renderSlice(root);
  const generated = await pathExists(board);
  return {
    slice: root,
    generated,
    moved,
    action: hadBoard && !moved.length ? 'kept' : 'migrated',
  };
}

export async function migrateProject(root) {
  const slices = await listSliceDirs(root);
  const results = [];
  for (const slice of slices) {
    results.push(await migrateSlice(slice));
  }
  return results;
}

function usage() {
  return '用法：node migrate_review_board.mjs [project-or-slice-dir]';
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  const target = argv.find((arg) => !arg.startsWith('--')) || process.cwd();
  const results = await migrateProject(target);
  if (!results.length) {
    process.stdout.write(`未找到工作流切片：${path.resolve(target)}\n`);
    return 0;
  }
  for (const item of results) {
    const moved = item.moved.length ? `；迁走 ${item.moved.join(', ')}` : '';
    process.stdout.write(`${item.action} ${item.slice}${moved}\n`);
  }
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`${error.message || error}\n`);
    process.exitCode = 1;
  });
}
