import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;
const installer = join(root, "bin", "install.js");

test("installs, requires update, updates, and uninstalls", async () => {
  const home = await mkdtemp(join(tmpdir(), "dtc-skills-test-"));
  const environment = { ...process.env, HOME: home };
  const target = join(home, ".trae", "skills", "grill-me-dtc-request", "SKILL.md");
  try {
    await exec(process.execPath, [installer, "--agent", "trae"], { env: environment });
    await access(target);
    assert.match(await readFile(target, "utf8"), /name: grill-me-dtc-request/);
    await assert.rejects(exec(process.execPath, [installer, "--agent", "trae"], { env: environment }), /--update/);
    await exec(process.execPath, [installer, "--update", "--agent", "trae"], { env: environment });
    await access(target);
    await exec(process.execPath, [installer, "--uninstall", "--agent", "trae", "--yes"], { env: environment });
    await assert.rejects(access(target));
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test("rejects conflicting arguments", async () => {
  await assert.rejects(exec(process.execPath, [installer, "--all", "--agent", "trae"]), /不能同时使用/);
});
