#!/usr/bin/env node
// 探测项目是否已采用 code-wiki（或其它满足 provider 契约的 skill）。只读，不安装、不建图谱。
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PROVIDER = 'code-wiki';

const SKILL_RELATIVE_PATHS = [
  '.cursor/skills/code-wiki/SKILL.md',
  '.codex/skills/code-wiki/SKILL.md',
  '.claude/skills/code-wiki/SKILL.md',
  '.agents/skills/code-wiki/SKILL.md',
];

const ARTIFACT_RELATIVE_PATHS = [
  'docs/project-wiki/code-wiki-repos.json',
  '.code-review-graph/graph.db',
  'graphify-out/graph.json',
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function skillRelativesFor(provider) {
  const name = provider || DEFAULT_PROVIDER;
  return [
    `.cursor/skills/${name}/SKILL.md`,
    `.codex/skills/${name}/SKILL.md`,
    `.claude/skills/${name}/SKILL.md`,
    `.agents/skills/${name}/SKILL.md`,
  ];
}

export async function detectCodeWiki(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const home = path.resolve(options.home || os.homedir());
  const configPath = path.join(root, '.product-workflow-config.json');
  const config = await readJson(configPath);
  const policy = config?.workflow_policy || {};
  const policyCodeWiki = policy.code_wiki || 'optional';
  const configuredProvider = policy.code_wiki_provider || null;
  const declined = policy.code_exploration === 'user_declined';

  const providerName = configuredProvider || DEFAULT_PROVIDER;
  const relatives = [
    ...skillRelativesFor(providerName),
    ...(providerName === DEFAULT_PROVIDER ? [] : SKILL_RELATIVE_PATHS),
  ];
  const skillCandidates = [...new Set([
    ...relatives.map((rel) => path.join(root, rel)),
    ...relatives.map((rel) => path.join(home, rel)),
  ])];
  const skillPaths = [];
  for (const file of skillCandidates) if (await exists(file)) skillPaths.push(file);

  const artifactHits = [];
  for (const rel of ARTIFACT_RELATIVE_PATHS) {
    const file = path.join(root, rel);
    if (await exists(file)) artifactHits.push(rel);
  }
  const reposManifest = path.join(root, 'docs/project-wiki/code-wiki-repos.json');
  const reposExists = await exists(reposManifest);

  const detected = skillPaths.length > 0
    || artifactHits.length > 0
    || Boolean(configuredProvider);
  return {
    detected,
    provider: detected ? (configuredProvider || DEFAULT_PROVIDER) : null,
    policy: policyCodeWiki,
    code_exploration: policy.code_exploration || null,
    declined,
    source: [
      ...(configuredProvider ? ['workflow_policy'] : []),
      ...(skillPaths.length ? ['skill'] : []),
      ...(artifactHits.length ? ['artifacts'] : []),
    ],
    skill_path: skillPaths[0] || null,
    artifact_paths: artifactHits,
    repos_manifest: reposExists ? reposManifest : null,
  };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('用法：node detect_code_wiki.mjs [project-root]\n');
    return 0;
  }
  const root = argv.find((arg) => !arg.startsWith('--')) || process.cwd();
  const result = await detectCodeWiki(root);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`${error.message || error}\n`);
    process.exitCode = 1;
  });
}
