#!/usr/bin/env node
// 校验 lite 切片的文件、短模板章节和状态。用于实现后/收尾前，不替代逐阶段 state 校验。
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFile, canonicalStatus } from './validate_workflow_state.mjs';

const REQUIRED = ['prd.md', 'development-plan.md', 'develop.md', '.workflow-state.json'];
const CUT_STAGES = [
  ['clarify', 'clarify.md'],
  ['project-wiki', 'project-wiki.md'],
  ['prototype', 'prototype.html'],
  ['stitch-prototype', 'stitch-prototype.md'],
  ['test-cases', 'test-cases.md'],
  ['test-automation', 'automation-test-plan.md'],
  ['technical-solution', 'technical-solution.md'],
  ['start-implement', 'start-implement.md'],
];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function hasHeading(text, name) {
  return new RegExp(`^#{1,6}\\s+.*${name}`, 'm').test(text);
}

export async function validateLiteSlice(target, options = {}) {
  const root = path.resolve(target);
  const errors = [];
  const warnings = [];
  for (const name of REQUIRED) {
    if (!(await exists(path.join(root, name)))) errors.push(`缺少 ${name}`);
  }
  if (errors.length) return { root, errors, warnings };

  const stateReport = await validateFile(path.join(root, '.workflow-state.json'));
  errors.push(...stateReport.errors);
  warnings.push(...stateReport.warnings);
  let state;
  try {
    state = JSON.parse((await fs.readFile(path.join(root, '.workflow-state.json'), 'utf8')).replace(/^\uFEFF/, ''));
  } catch {
    return { root, errors, warnings };
  }
  if (state.run_mode !== 'lite') errors.push(`run_mode 必须是 lite，当前 ${state.run_mode ?? '未写'}`);

  const stages = state.stages || state.phases || {};
  if (canonicalStatus(stages.prd) !== 'Reviewed') errors.push('lite 开工/收尾前 prd 必须为 Reviewed');
  if (canonicalStatus(stages['development-plan']) !== 'Draft') errors.push('lite development-plan 必须为 Draft（不单独请求批准）');
  const developStatus = canonicalStatus(stages.develop);
  if (!['Draft', 'Reviewed'].includes(developStatus)) errors.push('lite develop 必须为 Draft 或 Reviewed');
  for (const [id, file] of CUT_STAGES) {
    if (await exists(path.join(root, file))) errors.push(`lite 不生成 ${file}`);
    const value = stages[id];
    if (canonicalStatus(value) !== 'Not Applicable') {
      errors.push(`lite stages.${id} 必须为 Not Applicable`);
    } else if (!value || typeof value !== 'object' || !value.reason) {
      errors.push(`lite stages.${id} 缺裁剪原因`);
    }
  }

  const prd = await fs.readFile(path.join(root, 'prd.md'), 'utf8');
  for (const heading of ['范围', '验收', '验证', '不做']) {
    if (!hasHeading(prd, heading)) errors.push(`prd.md 缺「${heading}」章节`);
  }
  if (!/自动化测试[^\n]*(不适用|裁剪|原因)/.test(prd)) errors.push('prd.md 缺自动化测试裁剪原因');
  if (!/技术方案[^\n]*(不适用|裁剪|原因)/.test(prd)) errors.push('prd.md 缺技术方案裁剪原因');
  if (options.testAutomationRequired) {
    const override = (Array.isArray(state.explicit_overrides) ? state.explicit_overrides : [])
      .find((item) => item?.policy === 'workflow_policy.test_automation');
    if (!override || !override.reason || !override.risk || !override.recovery) {
      errors.push('配置要求自动化测试：lite 必须记录 workflow_policy.test_automation 的 explicit_override（reason/risk/recovery）');
    }
    if (!/explicit_override/i.test(prd)) errors.push('prd.md 缺 test_automation explicit_override 记录');
  }
  const plan = await fs.readFile(path.join(root, 'development-plan.md'), 'utf8');
  if (!/TASK-\d+/i.test(plan)) errors.push('development-plan.md 缺 TASK 编号');
  if (!hasHeading(plan, '验证命令')) errors.push('development-plan.md 缺「验证命令」章节');
  const develop = await fs.readFile(path.join(root, 'develop.md'), 'utf8');
  if (!hasHeading(develop, '验证证据')) errors.push('develop.md 缺「验证证据」章节');
  if (!/(通过|失败|阻断|未执行)/.test(develop)) errors.push('develop.md 未如实记录验证结果');

  return { root, errors, warnings };
}

function format({ root, errors, warnings }) {
  return [
    errors.length ? `lite 切片校验失败：${root}` : `lite 切片校验通过：${root}`,
    ...errors.map((line) => `错误  ${line}`),
    ...warnings.map((line) => `提醒  ${line}`),
  ].join('\n');
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('用法：node validate_lite_slice.mjs <workflow-dir>\n');
    return 0;
  }
  const target = argv.find((arg) => !arg.startsWith('--'));
  if (!target) {
    process.stderr.write('用法：node validate_lite_slice.mjs <workflow-dir>\n');
    return 1;
  }
  const report = await validateLiteSlice(target, { testAutomationRequired: argv.includes('--test-automation-required') });
  process.stdout.write(`${format(report)}\n`);
  return report.errors.length ? 1 : 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    process.stderr.write(`${error.message || error}\n`);
    process.exitCode = 1;
  });
}
