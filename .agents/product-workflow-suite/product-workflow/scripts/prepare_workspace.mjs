#!/usr/bin/env node
// 产品经理工作区：已有 git 则跳过拉取；空目录按仓库地址 clone。不装依赖、不建图谱。
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function usage() {
  return `用法：
  node prepare_workspace.mjs <workspace-dir> [--repo <git-url>] [--branch <name>] [--dir <subdir>]`;
}

export function parseArgs(argv) {
  const args = { workspace: '', repo: '', branch: '', dir: '', help: false };
  const rest = [...argv];
  while (rest.length) {
    const token = rest.shift();
    if (token === '--help' || token === '-h') args.help = true;
    else if (token === '--repo') args.repo = rest.shift() || '';
    else if (token === '--branch') args.branch = rest.shift() || '';
    else if (token === '--dir') args.dir = rest.shift() || '';
    else if (!token.startsWith('--') && !args.workspace) args.workspace = token;
    else throw new Error(`未知参数：${token}\n${usage()}`);
  }
  return args;
}

function exists(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}

function listVisible(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name !== '.DS_Store');
}

function isGitRoot(dir) {
  const gitPath = path.join(dir, '.git');
  if (!exists(gitPath)) return false;
  try {
    const st = fs.lstatSync(gitPath);
    if (st.isDirectory()) return true;
    if (st.isFile()) return /^gitdir:/m.test(fs.readFileSync(gitPath, 'utf8'));
  } catch {
    return false;
  }
  return false;
}

function cloneTarget(workspace, subdir) {
  if (!subdir) return workspace;
  if (path.isAbsolute(subdir) || subdir.split(/[\\/]/).includes('..')) {
    throw new Error(`--dir 只能是工作区下的相对目录：${subdir}`);
  }
  return path.join(workspace, subdir);
}

export function inspectWorkspace(workspaceDir) {
  const workspace = path.resolve(workspaceDir);
  const existsDir = exists(workspace);
  const entries = existsDir ? listVisible(workspace) : [];
  const empty = !existsDir || entries.length === 0;
  return {
    workspace,
    exists: existsDir,
    empty,
    git: isGitRoot(workspace),
    entries,
  };
}

function gitClone(repo, target, branch) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const args = ['clone', '--depth', '1'];
  if (branch) args.push('--branch', branch, '--single-branch');
  args.push(repo, target);
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git clone 失败\n${result.stderr || result.stdout || ''}`.trim());
  }
}

export function prepareWorkspace(workspaceDir, options = {}) {
  const inspect = inspectWorkspace(workspaceDir);
  if (inspect.git) {
    return { action: 'skipped-existing-git', ...inspect, target: inspect.workspace };
  }
  if (!inspect.empty) {
    return { action: 'skipped-nonempty', ...inspect, target: inspect.workspace };
  }
  if (!options.repo) {
    return { action: 'need-repo', ...inspect, target: inspect.workspace };
  }
  const target = cloneTarget(inspect.workspace, options.dir);
  if (exists(target) && listVisible(target).length) {
    throw new Error(`clone 目标已有文件：${target}`);
  }
  gitClone(options.repo, target, options.branch);
  return {
    action: 'cloned',
    workspace: inspect.workspace,
    target,
    repo: options.repo,
    branch: options.branch || '',
    git: isGitRoot(target),
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  if (!args.workspace) {
    process.stderr.write(`${usage()}\n`);
    return 1;
  }
  const result = prepareWorkspace(args.workspace, {
    repo: args.repo,
    branch: args.branch,
    dir: args.dir,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    process.exitCode = main();
  } catch (error) {
    process.stderr.write(`${error.message || error}\n`);
    process.exitCode = 1;
  }
}
