#!/usr/bin/env bun
/**
 * Test-file type-check guard
 *
 * Fails when any workspace package's `tsconfig.json` excludes its own test
 * files (`*.test.ts(x)` / `*.tests.ts`).
 *
 * Why this exists
 * ---------------
 * Test source is compiled by vitest's esbuild, which strips types without
 * checking them. The only reviewer of a test file's types is `check:ts`
 * (`tsc --noEmit`), and that program is the union of every package's
 * `tsconfig.json`. A test file only falls out of the type check when a
 * tsconfig `exclude` names it — and nothing stops a developer from adding
 * `"exclude": [ ... .test.ts ]` to silence a failing test file. CI then
 * goes green precisely *because* the file is unchecked, which is the opposite
 * of a guard: the exclusion purchases a green run by hiding the failure.
 *
 * What it deliberately does NOT do
 * --------------------------------
 * - It does not read the BUILD configs. `tsconfig.build.json` is allowed to
 *   exclude tests — those files must not ship in `dist`. That exclusion is the
 *   build's business, is read by `tsc -p tsconfig.build.json`, and does not
 *   hide a check failure, so it is not this guard's concern.
 * - It does not police *which* test files exist, or that they are correct. It
 *   only insists the check program can see the test files that DO exist.
 * - It does not read node_modules or bun.lock; it is a pure function of the
 *   manifest tree, so it needs no install.
 *
 * Usage:
 *   bun scripts/check-test-file-exclusions.ts            # check the repo, exit 1 on violations
 *   bun scripts/check-test-file-exclusions.ts --help
 */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

/** A package that carries its own `tsconfig.json`. */
export interface TypecheckPackage {
	/** Repo-relative path to the tsconfig.json, for error messages. */
	file: string;
	name: string;
	/** The tsconfig.json `exclude` array, empty when absent. */
	exclude: string[];
}

/** A package whose tsconfig.json excludes test files. */
export interface TestExclusionViolation {
	file: string;
	name: string;
	/** The offending `exclude` glob patterns. */
	patterns: string[];
}

/**
 * Matches a tsconfig `exclude` entry whose last path segment names test
 * files: `src/**\/*.test.ts`, `**\/*.tests.tsx`, `*.test.{ts,tsx}`,
 * `**\/*.test.*`, or a literal `src/lib/a.test.ts`. The repo uses both the
 * `.test.` (ds-utils, graph-example) and `.tests.` (react/ssr) infixes.
 */
const TEST_EXCLUDE = /\.tests?\.[^/]*$/;

/** One justified exception to the guard. */
export interface AllowlistEntry {
	/** Why this package cannot have its test files in its check program. */
	reason: string;
	/** The package name, as in its `package.json`. */
	name: string;
	/** The exact set of `exclude` patterns the reason covers. */
	patterns: string[];
}

/**
 * The allowlist. Each entry leads with the REASON a package may legitimately
 * exclude its own test files from the check program, so the entry still
 * explains itself after the package is renamed or absorbed. Empty at the time
 * this guard lands; nothing on main excludes test files from its check config.
 */
export const ALLOWLIST: readonly AllowlistEntry[] = [];

/**
 * Does a tsconfig `exclude` entry specifically target test files? A broad
 * `exclude` of, say, `node_modules` is not this guard's concern.
 */
function isTestExclude(entry: string): boolean {
	return TEST_EXCLUDE.test(entry);
}

/**
 * Pure core: given each package's tsconfig content, return every package that
 * excludes test files. Exported so the test can build the exact failing case
 * without touching the filesystem.
 */
export function findTestExclusions(
	packages: readonly TypecheckPackage[],
	allowlist: readonly AllowlistEntry[] = ALLOWLIST,
): TestExclusionViolation[] {
	const violations: TestExclusionViolation[] = [];
	for (const pkg of packages) {
		const patterns = pkg.exclude.filter(isTestExclude);
		if (patterns.length === 0) continue;
		// An entry matches the exact SET of offending patterns, so it cannot be
		// stretched to swallow a broader or narrower exclusion than it names.
		const allowed = allowlist.some(
			(entry) =>
				entry.name === pkg.name &&
				entry.patterns.length === patterns.length &&
				entry.patterns.every((p) => patterns.includes(p)),
		);
		if (allowed) continue;
		violations.push({ file: pkg.file, name: pkg.name, patterns });
	}
	return violations;
}

/**
 * Read every workspace package's `tsconfig.json`, driven by the globs in the
 * root `package.json` `workspaces` field. Nothing is hardcoded.
 */
export async function loadTypecheckPackages(
	rootDir: string,
): Promise<TypecheckPackage[]> {
	const rootManifest = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
	const globs: string[] = Array.isArray(rootManifest.workspaces)
		? rootManifest.workspaces
		: (rootManifest.workspaces?.packages ?? []);
	if (globs.length === 0) {
		throw new Error(
			`No workspace globs found in ${join(rootDir, "package.json")}.`,
		);
	}

	const files = new Set<string>();
	for (const pattern of globs) {
		const glob = new Bun.Glob(`${pattern}/package.json`);
		for await (const match of glob.scan({ cwd: rootDir })) {
			if (match.includes("node_modules")) continue;
			files.add(match);
		}
	}

	const packages: TypecheckPackage[] = [];
	for (const manifestFile of [...files].sort()) {
		const manifest = JSON.parse(
			await readFile(join(rootDir, manifestFile), "utf8"),
		);
		if (!manifest.name) continue;
		const tsconfigFile = manifestFile.replace(/\/package\.json$/, "/tsconfig.json");
		const tsconfigPath = join(rootDir, tsconfigFile);
		// No tsconfig.json (a config preset, an app with none, etc.): nothing to
		// check, and nothing hidden from a program that does not exist.
		if (!(await Bun.file(tsconfigPath).exists())) continue;
		// tsconfig.json is JSONC: comments and trailing commas are legal, so a
		// plain JSON.parse would reject a valid file. A file that is not even
		// valid JSONC throws here rather than being skipped as unchecked.
		const tsconfig = Bun.JSONC.parse(await readFile(tsconfigPath, "utf8")) as {
			exclude?: unknown;
		};
		const exclude = Array.isArray(tsconfig.exclude)
			? tsconfig.exclude.filter((e): e is string => typeof e === "string")
			: [];
		packages.push({ file: tsconfigFile, name: manifest.name, exclude });
	}
	return packages;
}

/**
 * Human-readable report.
 */
export function formatViolations(violations: TestExclusionViolation[]): string {
	const lines: string[] = [];
	const one = violations.length === 1;
	lines.push(
		`✗ ${violations.length} workspace package${one ? "" : "s"} ` +
			`exclude${one ? "s its" : " their"} own test files from the check program.`,
	);
	lines.push("");
	for (const v of violations) {
		lines.push(`  ${v.file}`);
		lines.push(`    in ${v.name}, "exclude" hides: ${v.patterns.join(", ")}`);
		lines.push(
			"    Tests compiled only by vitest are never type-checked when excluded here,",
		);
		lines.push(
			"    so a green check can hide a failing test file. Remove the exclusion from",
		);
		lines.push(
			"    tsconfig.json. To keep tests out of the build, put the exclusion in",
		);
		lines.push(
			"    tsconfig.build.json instead (TypeScript replaces rather than merges it",
		);
		lines.push(
			"    across extends, so the check config and build config can differ).",
		);
		lines.push("");
	}
	lines.push("If the exclusion is genuinely required, add an entry to");
	lines.push("scripts/check-test-file-exclusions.ts ALLOWLIST that states the reason");
	lines.push("and names the exact patterns it covers. The allowlist starts empty.");
	return lines.join("\n");
}

// -------------------------------------------------------------------
// CLI
// -------------------------------------------------------------------

async function findRepoRoot(start: string): Promise<string> {
	let dir = start;
	for (;;) {
		try {
			const manifest = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));
			if (manifest.workspaces) return dir;
		} catch {
			// keep walking
		}
		const parent = resolve(dir, "..");
		if (parent === dir) throw new Error(`No workspace root found above ${start}`);
		dir = parent;
	}
}

async function main(): Promise<number> {
	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		console.log(
			[
				"Usage: bun scripts/check-test-file-exclusions.ts",
				"",
				"Fails when a workspace package's tsconfig.json excludes its own test",
				"files (*.test.ts(x) / *.tests.ts(x)), which would hide those files from",
				"the type check. Build configs (tsconfig.build.json) are not read.",
				"",
				"Exit codes: 0 = every package's test files are visible to check:ts, 1 =",
				"at least one package excludes them.",
			].join("\n"),
		);
		return 0;
	}

	const rootDir = await findRepoRoot(resolve(import.meta.dir, ".."));
	const packages = await loadTypecheckPackages(rootDir);
	const violations = findTestExclusions(packages);

	if (violations.length === 0) {
		console.log(
			`✓ ${packages.length} type-checked workspace packages: no test-file exclusions.`,
		);
		return 0;
	}

	console.error(formatViolations(violations));
	return 1;
}

// Only run the CLI when invoked directly, so the test can import the module.
if (import.meta.main) {
	process.exit(await main());
}