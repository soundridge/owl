---
name: git-commit-push
description: Generate a Conventional Commit-style message (feat/fix/refactor/docs/style/chore/test/perf) from staged changes (after git add .), then commit and push. Use when the user wants Codex to read all staged files, create a commit message with a type prefix, commit, and push to origin.
---

# Git Commit Push

## Overview
Inspect all staged changes, produce a concise Conventional Commit-style message, commit, and push the current branch.

## Workflow

1) Verify staged changes
- Run `git diff --cached --name-only`.
- If empty, ask the user to stage changes first (or if you should stage them).
- If there are unstaged files, ignore them unless the user explicitly wants them included.

2) Read staged changes (all files)
- Run `git diff --cached`.
- If the diff is huge, still scan every staged file (use `git diff --cached -- <path>` per file). You must read all staged files before composing the message.

3) Choose commit type (Conventional Commit prefix)
Pick the most accurate type for the primary change:
- `feat`: new user-facing functionality or capability
- `fix`: bug fix
- `refactor`: code change without behavior change
- `style`: formatting, lint, or purely visual/UI styling
- `docs`: documentation only
- `test`: tests only
- `chore`: tooling, configs, build, deps, or non-user-facing maintenance
- `perf`: performance improvement

If changes span multiple areas, choose the most impactful user-visible change. If unrelated changes are mixed, ask whether to split into multiple commits.

Optional scope
- Use a short scope when obvious (e.g., `renderer`, `main`, `docs`).
- Format: `type(scope): summary`.

Summary rules
- Imperative voice, no trailing period.
- Keep under ~72 characters.
- Be specific (avoid “update”/“changes”/“misc”).

4) Commit
- Run: `git commit -m "type(scope): summary"`.
- If commit fails due to permissions/sandbox, rerun with required escalation or inform the user.

5) Push
- Run `git push`.
- If no upstream is set, run `git push -u origin <branch>` using the current branch from `git status -sb`.

## Quick example
- Diff shows UI token updates and formatting: `style(renderer): align theme tokens and tidy formatting`.
