# Playbook adoption — 2026-10-06

The user's complete playbook is preserved at the repository root and referenced by AGENTS.md. Existing `.claude/launch.json` and user marketing files were preserved.

| Tool/reference | Decision | Reason |
| --- | --- | --- |
| Agent Skills | Applied | Shared `project-playbook` skill provides reusable instructions and a dependency-free adoption script. |
| Ponytail | Installed (user scope, v4.13.0) and enabled | Active across all projects. Hooks bind SessionStart/SubagentStart/UserPromptSubmit and were reviewed before trust: no network calls, no process execution, no credential reads; state writes stay in its own config dirs. |
| Graphify | Exclusions prepared; tool not installed or run | `.graphifyignore` excludes credentials, private documents and generated files. Review actual indexing behavior and data transmission before use; exclusions alone are not a privacy guarantee. |
| OmniRoute | Not installed | No runtime multi-model gateway requirement. |
| Lenis | Not installed | No requested smooth-scrolling feature; preserve native navigation and accessibility. |
| Basement Studio Lab | Reference only | Preserve the scheduler's established sports poster identity. |

No application dependencies, external accounts, executable hooks or deployment were added by playbook adoption. Installation identity, licensing and data handling must be checked at the time an optional tool is actually selected.

## Other projects

In another chat, ask: `Use $project-playbook to apply my playbook to this project.` The shared skill is at `C:/Users/azhar/.codex/skills/project-playbook`; a new chat or skill refresh may be needed to discover it. It does not retroactively inject instructions into running chats.

Its `scripts/apply_playbook.py` previews changes by default; `--apply` copies the playbook, merges instruction pointers and prepares exclusions. It refuses a differing project playbook and preserves existing instructions. Other repositories were not modified.

## Adoption verification

The helper passed isolated checks for a non-mutating dry run, preservation of existing AGENTS/CLAUDE rules, Graphify exclusions and `.claude` configuration, repeated execution without changes, and refusal to replace a conflicting playbook. Skill name/description frontmatter passed standard-library validation. The bundled official quick validator could not run because its PyYAML dependency is absent; no global validation package was installed.
