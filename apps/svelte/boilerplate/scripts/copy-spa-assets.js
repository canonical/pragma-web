import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const assets = dirname(fileURLToPath(import.meta.resolve("@canonical/ds-assets/package.json")));
await mkdir("build-spa/icons", { recursive: true });
for (const name of ["information", "success", "warning", "error"]) {
  await copyFile(join(assets, "icons", `${name}.svg`), join("build-spa/icons", `${name}.svg`));
}
