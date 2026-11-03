# Navimow DTC Agent Skills

供 Navimow DTC 团队内部使用的 Agent Skills。目前包含 `grill-me-dtc-request`，用于把运营的初步想法整理为经过业务确认的需求初稿和分析材料。

## 环境要求

- Node.js 18 或更高版本
- 私有仓库 `navimow-dtc/dtc-agent-skills` 的访问权限
- 本机 Git 已能访问 GitHub 私有仓库

## 安装

```bash
npx github:navimow-dtc/dtc-agent-skills
```

指定 Agent：

```bash
npx github:navimow-dtc/dtc-agent-skills --agent trae
npx github:navimow-dtc/dtc-agent-skills --agent trae-cn
npx github:navimow-dtc/dtc-agent-skills --agent claude
npx github:navimow-dtc/dtc-agent-skills --agent codex
```

安装到所有支持的 Agent：

```bash
npx github:navimow-dtc/dtc-agent-skills --all
```

## 更新

```bash
npx github:navimow-dtc/dtc-agent-skills --update --all
```

## 卸载

```bash
npx github:navimow-dtc/dtc-agent-skills --uninstall --all
```

自动确认卸载：

```bash
npx github:navimow-dtc/dtc-agent-skills --uninstall --all --yes
```

卸载不会删除已经生成的 `DTC-Requirements` 交付物。

## 使用

重新打开 Agent 会话，然后输入：

```text
/grill-me-dtc-request

<你的初步需求>
```

生成交付物前，Skill 会要求选择本地保存目录。默认建议保存在下载或文稿目录下的 `DTC-Requirements`，不会默认写入当前项目。

## 支持的安装目录

| Agent | 安装目录 |
| --- | --- |
| Trae 国际版 | `~/.trae/skills/grill-me-dtc-request` |
| Trae 中国版 | `~/.trae-cn/skills/grill-me-dtc-request` |
| Claude Code | `~/.claude/skills/grill-me-dtc-request` |
| Codex / Agents | `~/.agents/skills/grill-me-dtc-request` |
