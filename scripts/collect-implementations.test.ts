import { expect, test } from "bun:test";
import { mkdtemp, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const collector = fileURLToPath(
	new URL("./collect-implementations.ts", import.meta.url),
);

test("removes stale objects when only story and test annotations remain", async () => {
	const cwd = await mkdtemp(join(tmpdir(), "collect-implementations-"));
	try {
		const pkg = join(cwd, "packages", "example");
		const src = join(pkg, "src");
		await mkdir(src, { recursive: true });
		await writeFile(
			join(cwd, "ds.config.json"),
			JSON.stringify({
				prefix: { short: "ds", namespace: "https://ds.canonical.com/" },
				repository: "https://example.com/example",
				defaults: { patterns: { react: "src/**/*.tsx" }, outputDir: "data" },
			}),
		);
		await writeFile(join(cwd, "package.json"), '{"workspaces":["packages/*"]}');
		await writeFile(join(pkg, "package.json"), '{"name":"@canonical/example"}');
		await writeFile(join(pkg, "design-system.json"), '{"platform":"react"}');

		const source = join(src, "Button.tsx");
		await writeFile(source, "/** @implements ds:global.component.button */\n");
		await writeFile(
			join(src, "Heading.stories.tsx"),
			"/** @implements ds:global.component.heading */\n",
		);

		const collect = () => {
			const result = Bun.spawnSync([process.execPath, collector], { cwd });
			expect(result.exitCode, result.stderr.toString()).toBe(0);
		};
		const data = join(cwd, "data");
		const index = Bun.file(join(data, "implementations.ttl"));
		const objects = Bun.file(join(data, "example", "implementationObjects.ttl"));
		collect();
		expect(await objects.text()).toContain("ds:global.component.button");
		expect(await index.text()).toContain("ds:implementationCount 1.");

		await rename(source, join(src, "Button.test.tsx"));
		collect();
		expect(await objects.exists()).toBe(false);
		expect(await index.text()).toContain("ds:implementationCount 0.");
	} finally {
		await rm(cwd, { recursive: true, force: true });
	}
});
