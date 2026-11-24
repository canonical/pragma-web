import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
	ALLOWLIST,
	type TypecheckPackage,
	findTestExclusions,
	loadTypecheckPackages,
} from "./check-test-file-exclusions";

function pkg(name: string, exclude: string[]): TypecheckPackage {
	return { file: `packages/${name}/tsconfig.json`, name, exclude };
}

describe("the exclusion this guard exists to catch", () => {
	const workspace = [
		pkg("@canonical/ds-utils", ["src/**/*.test.ts"]),
		pkg("@canonical/react-ssr", ["src/**/*.tests.ts"]),
		pkg("@canonical/clean", []),
	];

	test("a tsconfig excluding *.test.ts is reported", () => {
		const violations = findTestExclusions(workspace);
		expect(violations).toHaveLength(2);
		expect(violations.map((v) => v.name)).toEqual([
			"@canonical/ds-utils",
			"@canonical/react-ssr",
		]);
		expect(violations[0]).toMatchObject({
			file: "packages/@canonical/ds-utils/tsconfig.json",
			patterns: ["src/**/*.test.ts"],
		});
	});

	test("removing the exclusions clears them", () => {
		const fixed = workspace.map((p) => ({ ...p, exclude: [] }));
		expect(findTestExclusions(fixed)).toEqual([]);
	});

	test("an exclusion that does not name test files is ignored", () => {
		const violations = findTestExclusions([
			pkg("@canonical/build-only", ["node_modules", "dist"]),
		]);
		expect(violations).toEqual([]);
	});

	test("the allowlist is empty at the time the guard lands", () => {
		expect(ALLOWLIST).toHaveLength(0);
	});
});

describe("pattern forms", () => {
	test.each([
		"src/**/*.test.tsx",
		"**/*.tests.ts",
		"src/**/*.test.{ts,tsx}",
		"**/*.test.*",
		"src/lib/a.test.ts",
	])("%s is reported", (pattern) => {
		expect(findTestExclusions([pkg("@canonical/x", [pattern])])).toHaveLength(1);
	});

	test("a directory that merely contains 'test' is ignored", () => {
		expect(
			findTestExclusions([pkg("@canonical/x", ["src/testing/**", "test-fixtures"])]),
		).toEqual([]);
	});
});

describe("the allowlist", () => {
	const entry = {
		reason: "the file augments a module globally and runs in its own program",
		name: "@canonical/x",
		patterns: ["src/lib/register.types.test.ts"],
	};

	test("an entry covering the exact patterns lets the package pass", () => {
		expect(
			findTestExclusions([pkg("@canonical/x", entry.patterns)], [entry]),
		).toEqual([]);
	});

	test("an entry cannot be stretched to cover a broader exclusion", () => {
		const violations = findTestExclusions(
			[pkg("@canonical/x", ["src/lib/register.types.test.ts", "src/**/*.test.ts"])],
			[entry],
		);
		expect(violations).toHaveLength(1);
	});

	test("an entry for another package does not apply", () => {
		expect(
			findTestExclusions([pkg("@canonical/y", entry.patterns)], [entry]),
		).toHaveLength(1);
	});
});

describe("loadTypecheckPackages", () => {
	test("reads a tsconfig.json with comments and trailing commas", async () => {
		const root = await mkdtemp(join(tmpdir(), "test-exclusions-"));
		try {
			await writeFile(
				join(root, "package.json"),
				JSON.stringify({ workspaces: ["packages/*"] }),
			);
			await mkdir(join(root, "packages/a"), { recursive: true });
			await writeFile(
				join(root, "packages/a/package.json"),
				JSON.stringify({ name: "@canonical/a" }),
			);
			await writeFile(
				join(root, "packages/a/tsconfig.json"),
				'{\n  // a comment\n  "exclude": ["src/**/*.test.ts",],\n}\n',
			);

			const packages = await loadTypecheckPackages(root);

			expect(packages).toEqual([
				{
					file: "packages/a/tsconfig.json",
					name: "@canonical/a",
					exclude: ["src/**/*.test.ts"],
				},
			]);
			expect(findTestExclusions(packages)).toHaveLength(1);
		} finally {
			await rm(root, { recursive: true, force: true });
		}
	});
});