#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { constants } from "node:fs";
import { access, cp, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "grill-me-dtc-request";
const SOURCE = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", SKILL_NAME);
const TARGETS = {
  trae: join(homedir(), ".trae", "skills", SKILL_NAME),
  "trae-cn": join(homedir(), ".trae-cn", "skills", SKILL_NAME),
  claude: join(homedir(), ".claude", "skills", SKILL_NAME),
  codex: join(homedir(), ".agents", "skills", SKILL_NAME)
};

function parseArgs(argv) {
  const options = { agents: [], all: false, update: false, uninstall: false, yes: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--agent") {
      const agent = argv[index + 1];
      if (!agent) throw new Error("--agent 需要一个目标名称");
      options.agents.push(agent);
      index += 1;
    } else if (argument === "--all") options.all = true;
    else if (argument === "--update") options.update = true;
    else if (argument === "--uninstall") options.uninstall = true;
    else if (argument === "--yes") options.yes = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`未知参数：${argument}`);
  }
  return options;
}

function printHelp() {
  console.log(`Navimow DTC Agent Skills

用法：
  dtc-skills --agent <trae|trae-cn|claude|codex>
  dtc-skills --all
  dtc-skills --update [--agent <name>|--all]
  dtc-skills --uninstall [--agent <name>|--all] [--yes]
`);
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function validateAgents(agents) {
  const invalid = agents.filter((agent) => !TARGETS[agent]);
  if (invalid.length) throw new Error(`不支持的 Agent：${invalid.join(", ")}`);
  return [...new Set(agents)];
}

async function promptAgents() {
  const prompt = createInterface({ input: stdin, output: stdout });
  console.log("\nNavimow DTC Agent Skills\n");
  console.log("1. Trae 国际版");
  console.log("2. Trae 中国版");
  console.log("3. Claude Code");
  console.log("4. Codex / Agents");
  console.log("5. 所有支持的 Agent");
  const answer = await prompt.question("\n请选择安装目标 [1-5]：");
  prompt.close();
  const choices = { "1": ["trae"], "2": ["trae-cn"], "3": ["claude"], "4": ["codex"], "5": Object.keys(TARGETS) };
  if (!choices[answer.trim()]) throw new Error("无效选择");
  return choices[answer.trim()];
}

async function confirmUninstall(agents) {
  const prompt = createInterface({ input: stdin, output: stdout });
  const answer = await prompt.question(`确认从 ${agents.join(", ")} 卸载 ${SKILL_NAME}？[y/N]：`);
  prompt.close();
  return answer.trim().toLowerCase() === "y";
}

async function atomicInstall(target, allowReplace) {
  const parent = dirname(target);
  await mkdir(parent, { recursive: true });
  const targetExists = await exists(target);
  if (targetExists && !allowReplace) throw new Error(`${target} 已存在，请使用 --update`);

  const stagingRoot = await mkdtemp(join(tmpdir(), "dtc-skills-"));
  const staged = join(stagingRoot, SKILL_NAME);
  const backup = `${target}.backup-${process.pid}`;
  try {
    await cp(SOURCE, staged, { recursive: true });
    if (!(await exists(join(staged, "SKILL.md")))) throw new Error("Skill 源文件不完整");
    if (targetExists) await rename(target, backup);
    await rename(staged, target);
    if (!(await exists(join(target, "SKILL.md")))) throw new Error("安装后校验失败");
    if (targetExists) await rm(backup, { recursive: true, force: true });
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    if (await exists(backup)) await rename(backup, target);
    throw error;
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();
  if (options.update && options.uninstall) throw new Error("--update 与 --uninstall 不能同时使用");
  if (options.all && options.agents.length) throw new Error("--all 与 --agent 不能同时使用");

  let agents = options.all ? Object.keys(TARGETS) : validateAgents(options.agents);
  if (!agents.length) agents = await promptAgents();

  if (options.uninstall) {
    if (!options.yes && !(await confirmUninstall(agents))) return console.log("已取消卸载");
    for (const agent of agents) {
      const target = TARGETS[agent];
      if (await exists(target)) {
        await rm(target, { recursive: true });
        console.log(`已从 ${agent} 卸载：${target}`);
      } else console.log(`${agent} 未安装，已跳过`);
    }
    return;
  }

  for (const agent of agents) {
    await atomicInstall(TARGETS[agent], options.update);
    console.log(`${options.update ? "已更新" : "已安装"}到 ${agent}：${TARGETS[agent]}`);
  }
  console.log("\n请重新打开 Agent 会话，然后使用 /grill-me-dtc-request。\n");
}

main().catch((error) => {
  console.error(`安装失败：${error.message}`);
  process.exitCode = 1;
});
