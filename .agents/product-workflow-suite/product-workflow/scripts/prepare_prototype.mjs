#!/usr/bin/env node
// 为已有 prototype.html 补本地 Mermaid 资源与 Review Board 回链；幂等，不改业务正文。
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureMermaid } from './ensure_mermaid.mjs';

export async function preparePrototype(target) {
  const root = path.resolve(target);
  const file = path.join(root, 'prototype.html');
  let html = await fs.readFile(file, 'utf8');
  let changed = false;

  if (!/href\s*=\s*["']\.review-board\/index\.html#prototype["']/i.test(html)) {
    const link = '<a data-product-workflow-backlink href=".review-board/index.html#prototype">返回评审看板</a>';
    if (/<body(?:\s[^>]*)?>/i.test(html)) html = html.replace(/<body(?:\s[^>]*)?>/i, (tag) => `${tag}\n${link}`);
    else html = `${link}\n${html}`;
    changed = true;
  }

  if (/<(?:pre|div)[^>]*class=["'][^"']*\bmermaid\b/i.test(html)
      && !/<script[^>]+src=["']\.\/mermaid\.min\.js["']/i.test(html)) {
    const script = '<script src="./mermaid.min.js"></script>';
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${script}\n</body>`);
    else html = `${html}\n${script}\n`;
    changed = true;
  }

  if (changed) await fs.writeFile(file, html);
  if (/<script[^>]+src=["']\.\/mermaid\.min\.js["']/i.test(html)) await ensureMermaid(root);
  return { file, changed, backlink: true, mermaid: /\.\/mermaid\.min\.js/.test(html) };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('用法：node prepare_prototype.mjs <workflow-dir>\n');
    return 0;
  }
  const target = argv.find((arg) => !arg.startsWith('--'));
  if (!target) {
    process.stderr.write('用法：node prepare_prototype.mjs <workflow-dir>\n');
    return 1;
  }
  const result = await preparePrototype(target);
  process.stdout.write(`${result.changed ? 'prepared' : 'kept'} ${result.file}\n`);
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`${error.message || error}\n`);
    process.exitCode = 1;
  });
}
