# Forge brief: shared rules for every agent working on the prism extraction

Read this whole file first. Then read the plan: `/root/.claude/plans/also-we-d-like-the-frolicking-pudding.md` (the "Rulings" section and your PR's section). Two exploration reports describe the code you will touch: `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/forge/explore-lib-relay-server.md` and `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/forge/explore-lenses.md`.

## Repositories and rules

- pragma-web: `/home/user/pragma-web` (GitHub `canonical/pragma-web`). pragma-core: `/home/user/pragma-core` (GitHub `canonical/pragma-core`). Neither has a CLAUDE.md; the rules live in `AGENTS.md` and `.kb/*.md` at each repo root. Read `AGENTS.md`, `.kb/commits.md`, `.kb/pre-push.md`, `.kb/module-imports.md`, `.kb/react-props.md`, `.kb/pull-requests.md`, `.kb/branches-and-worktrees.md`, `.kb/this-repository.md` before changing anything. They are short.
- pragma-web consumes pragma-core packages from npm at exact pins; never add a workspace link across repos.
- No `#` alias imports in any tsc-built package (`.kb/module-imports.md`); relative imports with `.js`. Apps may use `#` aliases.
- Packages use `*.test.ts(x)`; the apps use `*.tests.ts(x)`. A misnamed test file is silently not collected.
- Comments explain the code, never its provenance (no "moved from", no plan or ticket references). Commit subjects and PR bodies cite no internal planning document.
- The constitution (`CONSTITUTION.md` at each root) is law: no magic, explicit conventions, DRY only for stable patterns, minimal tooling.

## Pragma code standards: mandatory, without exception

Every line you write or change follows the pragma code standards, the `cs:` standards published as `@canonical/code-standards`. A digest with every standard's identity, rule, do and don't is at `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/forge/CODE_STANDARDS.md`; read the sections for the languages you touch (code, css, styling, react, testing, tsdoc, storybook, packaging, git, ui) before writing, and the full Turtle with examples is in `/home/user/pragma-core/packages/semantics/code-standards/data/`. Among them, the ones most often broken: domain constants in `constants.ts` and reusable types in `types.ts`; functions named with a verb, pure by default, one responsibility, defined near their use; `.at()` for array access; invariants asserted at runtime; defensive fallbacks only at external boundaries; styles scoped to the component's root class with role-based child class names in kebab-case, design tokens over raw values, state attributes and modifier classes, `:has()` for state styling, container queries over ResizeObserver; TSDoc on every exported symbol with `@note` on impurity; the `ds` selector namespace. Reviewers treat a broken standard as a `high` finding citing the standard's CURIE. One recorded exception stands: tests in the docsite app are `*.tests.ts(x)` (the app pins it), packages use `*.test.ts(x)`.

## Bun

Bun is pinned to 1.4.3 (`.bun-version`). The system `bun` is 1.4.2. Use `BUN=/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/bun143/node_modules/.bin/bun` for every `install` (lockfile), and prefer it for `bun run` too. The lockfile settles in two installs: run `$BUN install` twice when manifests changed, commit the resulting `bun.lock`.

## Worktrees and branches

One worktree per PR, under `/home/user/worktrees/`. Never work in `/home/user/pragma-web` or `/home/user/pragma-core` directly: other forges run at the same time.

```sh
BUN=/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/bun143/node_modules/.bin/bun
git -C /home/user/pragma-web fetch origin
git -C /home/user/pragma-web worktree add /home/user/worktrees/<slug> -b claude/prism-<slug> <base-ref>
cd /home/user/worktrees/<slug> && $BUN install      # the prepare hook builds every package; takes a few minutes the first time
```

`<base-ref>` is given in your PR brief (for pragma-web either `claude/prism-consumption-api-design-20wwry`, the schema-gate branch of PR 1493, or `origin/main`; for pragma-core `origin/main`). If the worktree already exists (a fixer or reviewer joining), just `cd` into it.

## Commits

Conventional subjects `type(scope): subject` with the package name as scope (`refactor(pragma-docs): …`, `feat(prism-core): …`). Atomic commits, one logical change each. Every commit message ends with these two lines, exactly:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017LLNbBY4BgwLo1hP4GNPer
```

The model name in the `Co-Authored-By` line is the one the harness's own attribution reminder gives the committing agent (`Claude Fable 5.1` or `Claude Opus 5.5`); either is correct, and a reviewer never reports it. Never put a model name anywhere else (code, comments, PR text). Do not push unless you are the gate agent.

Pushes to pragma-core are refused with HTTP 403 by the GitHub App installation (the Claude GitHub App is not installed on canonical/pragma-core). A pragma-core gate agent runs the checks, tries one push, and on a 403 stops: no retries, no other route (no MCP file-push, no personal token). It then writes a git bundle of the branch (`git bundle create /tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/bundles/<branch-slug>.bundle origin/main..<branch>`) and the PR body (title on the first line, then the template body) to `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/pr-bodies/<branch-slug>.md`, and returns `pushed: false` with both paths.

## Verification (what "green" means)

- In the package or app you touched: `bun run check` and `bun run test`. The docsite's `check` includes `schema:check` (boots the pragma provider over installed ref packages, ~5 s) and `relay:check` (regenerates artifacts and diffs them); after editing any `graphql` tag or the schema, run `bun run relay` and commit the artifacts.
- From the repository root: `bun run check` must pass. `bun run test` from the root is known to fail in `@canonical/svelte-ds-global` and `@canonical/styles-vanilla-adapter` for an environment reason (a Playwright browser build missing from this container); every other package must pass. Run root `test` with `bun run lerna run test --ignore '@canonical/svelte-*' --ignore '@canonical/styles-vanilla-adapter' --no-bail`.
- The docsite's e2e suite (`test:e2e`) boots six servers; run it only when your PR touches the server layer (PR A does).
- Coverage thresholds are enforced per package; do not lower them. Satisfy lint and coverage together.

## Pull requests (gate agent only)

Push with `git push -u origin claude/prism-<slug>`. Open the PR with the GitHub MCP tool (load it with ToolSearch: `select:mcp__github__create_pull_request`), repository as given, `head` = the branch, `base` = the PR's base branch from the brief, title = the conventional subject from the plan. The body follows `.github/PULL_REQUEST_TEMPLATE.md` exactly (Done, QA, the readiness checklist ticked honestly, Screenshots), stands on its own (no plan or ticket citations), notes the number of adversarial review rounds, and ends with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_017LLNbBY4BgwLo1hP4GNPer

---
_Generated by [Claude Code](https://claude.ai/code)_
```

If the tool is unavailable, do not try another way: report the branch and say the PR was not opened.

## Roles

- **Planner**: reads the plan's PR section, the brief, the reports and the code; returns a concrete implementation plan (files to create, move, delete; exact public API; tests to write or move; commit sequence; risks). No code changes.
- **Implementer**: creates the worktree, implements the planner's plan, runs the package/app gates, commits. Returns `{ worktree, branch, summary, gate }` where `gate` quotes the final check/test output lines. Does not push. Does not widen scope: anything the plan does not name is left alone and reported as a follow-up.
- **Reviewer**: in the worktree, reads `git diff <base-ref>...HEAD` and the touched files, runs whatever read-only checks help, and returns findings. Adversarial: try to break the change; a finding needs a concrete failure path. Severity: `high` = wrong behaviour, a regression, a broken gate, or a violation of a ruling in the plan or a rule in `.kb`; `medium` = a reviewer would block merge on it (missing test for a changed behaviour, an API wider than the plan, duplicated logic the repo already has, a convention broken); `low` = nit. Scope creep is a finding: name what to remove. Never propose features the plan does not name.
- **Fixer**: applies exactly the medium and high findings handed to it, in the worktree, re-runs the gates, commits. Nothing else.
- **Gate**: runs the root `check` and the affected tests, pushes, opens the PR, returns the URL and the final gate output.


## Design rebuild rules (from 2026-10-22; apply to every PR from S1 on)

- **Base and integration.** New pragma-web PRs are based on `claude/prism-integration` or on their predecessor in the plan. Before implementing, the implementer runs `git merge --no-ff claude/prism-integration` (the local branch; it moves while other forges run) and resolves conflicts; `bun.lock` by two pinned installs; Relay artifacts and committed schemas with the apps' own scripts.
- **The CLI.** The published, pinned pragma CLI is installed at `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/pragma-cli/node_modules/.bin/pragma` (0.43.0). Scaffold every component with `pragma create component react <path> --yes` run from the target package's root (the generator reads the package name there to pick the CSS layer). Relay projections use the CLI built from R's branch (`node /home/user/worktrees/r-relay-generator/packages/cli/pragma/dist/src/bin.js`, after `bun run build` there) with `--relay`, until R is released.
- **Placement.** General components: `src/lib/ui/<Name>/` in packages and apps. Domain components in apps: `src/domains/<subject>/lib/<Name>/`; the domain's routes, warm functions and queries sit at the domain root. A domain is a subject (`components`, `metro`), not a lens.
- **Anatomy first.** Every component folder carries `anatomy.yaml` (the anatomy DSL: `@canonical/anatomy-dsl`, pragma-core `packages/semantics/anatomy-dsl`, README and `docs/api-reference.md`; style keys from `definitions/style-keys.yaml`; token symbols in their dotted spelling; lists are `var()` chains; `@hover` and friends are states; slots with cardinalities; projections with `projection.on` and `projection.field`). The planner writes the anatomies; the implementer transcribes them into `styles.css` (the same properties, the same chains, the same order, the same states, nothing else) and runs the checks from prism-core's `testing/` (`assertAnatomy`, `assertStylesMatchAnatomy`, `assertScaffold`, the stylesheet check) once S2 has added them; before S2 the stylesheet census in `packages/prism/lens-definitions/src/testing` is the model.
- **Tokens.** Spacing only from `@canonical/styles` spacing.css (the shim); colour only from semantic tokens; component tokens on the component root, bound to semantic tokens or the shim; no `--dimension-*`, no raw lengths other than 0. Every untokenised decision is bound in the anatomy to its literal and listed in the PR body under "Token ledger".
- **Design reviewer.** Every UI PR has a design reviewer who works from `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/forge/DESIGN_HEURISTICS.md` as a numbered checklist, boots the app, takes screenshots at 1440 and 390 in light and dark (Playwright from the worktree's node_modules with `executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"`), measures spacing (every gap and inset a multiple of 4px) and the scroll model, and compares with the reference (the Figma frames through the Figma MCP tools, the ontology explorer at `/root/.claude/uploads/73d142fc-2afc-5e76-bb53-6c9426202581/5c28b4b4-ontology-explorer.html`, the atlas compositions under `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/artifact-files/14d5aa04-9d2a-4bcd-87c5-89b4475fb02d`). Screenshots go to `/tmp/claude-0/-home-user/73d142fc-2afc-5e76-bb53-6c9426202581/scratchpad/checkpoints/<PR>/`.
- **Ports.** Each agent that boots an app picks free ports above 30000 and stops every process it started before returning.
- **Models.** Fable is allowed again and is used where the plan says (planners of S2, S3 and S4; the design reviewer of every UI PR).
