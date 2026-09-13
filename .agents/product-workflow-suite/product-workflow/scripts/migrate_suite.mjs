#!/usr/bin/env node
// 升级 product-workflow 项目资产：state、原型回链、评审看板和章程托管块。
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { canonicalStatus } from './validate_workflow_state.mjs';
import { preparePrototype } from './prepare_prototype.mjs';
import { listSliceDirs, migrateSlice as migrateBoardSlice } from './migrate_review_board.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const suiteRoot = path.resolve(scriptDir, '..', '..');
const defaultVersionFile = path.join(suiteRoot, 'VERSION');
const defaultCharterTemplate = path.join(suiteRoot, 'product-init', 'references', 'agents-charter-template.md');
const BEGIN_RE = /<!-- BEGIN product-workflow charter suite=(v?[^\s]+) -->/;
const BLOCK_RE = /<!-- BEGIN product-workflow charter suite=v?[^\s]+ -->[\s\S]*?<!-- END product-workflow charter -->/;
const HASH_RE = /\n<!-- product-workflow charter source-sha256=([a-f0-9]{64}) -->/;

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

export async function readSuiteVersion(versionFile = defaultVersionFile) {
  const first = (await fs.readFile(versionFile, 'utf8')).split(/\r?\n/, 1)[0].trim();
  const match = first.match(/^haitian-pw-(\d+\.\d+\.\d+)$/);
  if (!match) throw new Error(`VERSION 首行不是 haitian-pw-x.y.z：${first}`);
  return `v${match[1]}`;
}

function normalizeBlock(block) {
  return block
    .replace(/\r\n/g, '\n')
    .replace(HASH_RE, '')
    .replace(BEGIN_RE, '<!-- BEGIN product-workflow charter suite=VERSION -->')
    .trim();
}

function blockHash(block) {
  return createHash('sha256').update(normalizeBlock(block)).digest('hex');
}

export async function desiredCharterBlock(version, templateFile = defaultCharterTemplate) {
  const template = await fs.readFile(templateFile, 'utf8');
  const block = template.match(BLOCK_RE)?.[0];
  if (!block) throw new Error(`章程模板缺托管块：${templateFile}`);
  const versioned = block.replace(BEGIN_RE, `<!-- BEGIN product-workflow charter suite=${version} -->`);
  return versioned.replace('\n', `\n<!-- product-workflow charter source-sha256=${blockHash(versioned)} -->\n`);
}

export async function refreshManagedCharter(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const candidates = [path.join(root, 'AGENTS.md'), path.join(root, 'CLAUDE.md')];
  const charterFile = candidates.find((file) => options.charterFile === file)
    || await (async () => {
      for (const file of candidates) if (await exists(file)) return file;
      return null;
    })();
  if (!charterFile) return { action: 'not-found', file: null };

  const version = options.version || await readSuiteVersion(options.versionFile);
  const desired = await desiredCharterBlock(version, options.templateFile);
  const original = await fs.readFile(charterFile, 'utf8');
  const current = original.match(BLOCK_RE)?.[0];
  if (!current) return { action: 'no-managed-block', file: charterFile, version };

  const currentVersion = current.match(BEGIN_RE)?.[1];
  const recordedHash = current.match(HASH_RE)?.[1];
  const matchesDesired = normalizeBlock(current) === normalizeBlock(desired);
  // 有 hash：必须和当前块一致，否则视为人工改过。
  // 无 hash 且版本落后：0.4.0 现场块，按官方升级刷新。
  // 无 hash 且已是当前版本：内容必须能对上现行模板，才能补 hash。
  const currentIsIntact = recordedHash
    ? recordedHash === blockHash(current)
    : matchesDesired || currentVersion !== version;
  if (!currentIsIntact) {
    throw new Error(`章程托管块与已记录源不一致，疑似有人改过：${charterFile}\n请先人工裁决块内差异；块外内容未改。`);
  }
  if (currentVersion === version && current === desired) return { action: 'kept', file: charterFile, version };

  const updated = original.replace(BLOCK_RE, desired);
  await fs.writeFile(charterFile, updated);
  return { action: 'refreshed', file: charterFile, from: currentVersion, version };
}

export async function migrateWorkflowState(slice) {
  const file = path.join(path.resolve(slice), '.workflow-state.json');
  if (!(await exists(file))) return { action: 'not-found', file };
  const original = JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  if (!original || typeof original !== 'object' || Array.isArray(original)) {
    throw new Error(`state 必须是 JSON 对象：${file}`);
  }

  const state = { ...original };
  let changed = false;
  if (state.schema_version === undefined) {
    state.schema_version = 1;
    changed = true;
  }
  if (state.current_stage === undefined && state.currentStage !== undefined) {
    state.current_stage = state.currentStage;
    changed = true;
  }
  if (state.currentStage !== undefined) {
    delete state.currentStage;
    changed = true;
  }
  if (state.stages === undefined && state.phases !== undefined) {
    state.stages = state.phases;
    delete state.phases;
    changed = true;
  }
  if (state.stages && typeof state.stages === 'object' && !Array.isArray(state.stages)) {
    const stages = {};
    for (const [id, value] of Object.entries(state.stages)) {
      if (typeof value === 'string') {
        stages[id] = { status: canonicalStatus(value) || value };
        changed = true;
      } else if (value && typeof value === 'object') {
        const status = canonicalStatus(value);
        if (status && status !== value.status) {
          stages[id] = { ...value, status };
          changed = true;
        } else {
          stages[id] = value;
        }
      } else {
        stages[id] = value;
      }
    }
    state.stages = stages;
  }

  if (changed) await fs.writeFile(file, `${JSON.stringify(state, null, 2)}\n`);
  return { action: changed ? 'migrated' : 'kept', file };
}

export async function migratePrototypeBacklink(slice) {
  const file = path.join(path.resolve(slice), 'prototype.html');
  if (!(await exists(file))) return { action: 'not-found', file };
  const original = await fs.readFile(file, 'utf8');
  const legacy = /(href\s*=\s*["'])(?:\.\/)?index\.html#prototype(?=["'])/gi;
  const updated = original.replace(legacy, '$1.review-board/index.html#prototype');
  if (updated !== original) await fs.writeFile(file, updated);
  const prepared = await preparePrototype(slice);
  return { action: updated !== original || prepared.changed ? 'migrated' : 'kept', file };
}

export async function migrateSuite(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const slices = await listSliceDirs(root);
  const results = [];
  for (const slice of slices) {
    const state = await migrateWorkflowState(slice);
    const prototype = await migratePrototypeBacklink(slice);
    const board = await migrateBoardSlice(slice);
    results.push({ slice, state, prototype, board });
  }
  const charter = await refreshManagedCharter(root, options);
  return { root, version: options.version || await readSuiteVersion(options.versionFile), charter, slices: results };
}

function usage() {
  return '用法：node migrate_suite.mjs [project-or-slice-dir]';
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  const target = argv.find((arg) => !arg.startsWith('--')) || process.cwd();
  const result = await migrateSuite(target);
  process.stdout.write(`suite ${result.version}：${result.root}\n`);
  process.stdout.write(`charter ${result.charter.action}${result.charter.file ? ` ${result.charter.file}` : ''}\n`);
  for (const item of result.slices) {
    process.stdout.write(`slice ${item.slice}；state=${item.state.action}；prototype=${item.prototype.action}；board=${item.board.action}\n`);
  }
  if (!result.slices.length) process.stdout.write('未找到工作流切片；只检查项目章程。\n');
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
