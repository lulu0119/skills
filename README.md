# Agent Skills

Reusable [Agent Skills](https://agentskills.io) for Cursor, Claude Code, Codex, and other agents that load `SKILL.md`.

Each skill is a folder under `skills/` with a portable `SKILL.md` contract. Install selectively via [skills.sh](https://skills.sh) / the `skills` CLI.

## Skills


| Skill                                                                  | Description                                                                                                                |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `[poster-image-to-html](./skills/poster-image-to-html/)`               | Faithful HTML recreation of poster/banner reference images with Playwright PNG compare loop                                |
| `[modular-svg-illustration](./skills/modular-svg-illustration/)`       | Modular SVG illustration — assemble primitives into depth-sorted scenes ([demos](./skills/modular-svg-illustration/README.md#preview)) |




## Layout

```text
skills/
  <skill-name>/
    SKILL.md          # required — frontmatter + instructions
    scripts/          # optional
    references/       # optional
    assets/           # optional
    examples/         # optional demos for that skill
```



## Install

List skills in this repo:

```bash
npx skills add lulu0119/skills --list
```

Install one skill:

```bash
npx skills add lulu0119/skills --skill poster-image-to-html
npx skills add lulu0119/skills --skill modular-svg-illustration
```

Install everything:

```bash
npx skills add lulu0119/skills --skill '*' -y
```

From a local clone:

```bash
npx skills add . --list
npx skills add . --skill poster-image-to-html
```



## Add a skill

1. Create `skills/<skill-name>/SKILL.md` with YAML frontmatter (`name`, `description`). `name` must match the folder name (kebab-case).
2. Keep `SKILL.md` focused; put long reference material in sibling files (`reference.md`, `references/`, `scripts/`).
3. List the skill in the table above.
4. Optional: add demos under that skill’s `examples/`.



## License

MIT — see [LICENSE](./LICENSE).