// @vitest-environment node

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertAnatomy,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "../../../testing/index.js";

/** The fixture packages the checks run against. */
const CONFORMING = fileURLToPath(
  new URL("../../../testing/fixtures/conforming", import.meta.url),
);
const DRIFTED = fileURLToPath(
  new URL("../../../testing/fixtures/drifted", import.meta.url),
);

/** The folder of one fixture component in a fixture package. */
const locate = (packageRoot: string, name: string): string =>
  join(packageRoot, "src", "lib", "ui", name);

/** The semantic tokens the fixtures read. */
const EXTERNAL_TOKENS = [
  "--color-text",
  "--color-text-muted",
  "--typography-text-primary-bold-font-weight",
];

describe("the component checks", () => {
  describe("listAnatomyFolders", () => {
    it("lists each component folder of the directories it is given", () => {
      expect(
        listAnatomyFolders([
          join(CONFORMING, "src", "lib", "ui"),
          join(CONFORMING, "src", "domains"),
        ]),
      ).toEqual([locate(CONFORMING, "Probe")]);
    });
  });

  describe("on a conforming component", () => {
    const folder = locate(CONFORMING, "Probe");

    it("passes every check", () => {
      const specification = assertAnatomy(folder);
      expect(specification.root.uri).toBe("prism.component.probe");
      expect(() =>
        assertStylesMatchAnatomy(folder, specification),
      ).not.toThrow();
      expect(() =>
        assertScaffold(folder, { packageRoot: CONFORMING, testSuffix: "test" }),
      ).not.toThrow();
      expect(() =>
        assertStylesheets({
          directory: folder,
          layer: "ds.components.global",
          externalTokens: EXTERNAL_TOKENS,
        }),
      ).not.toThrow();
    });
  });

  describe("on a drifted component", () => {
    it("names each binding the stylesheet changed or dropped", () => {
      const folder = locate(DRIFTED, "StyleDrift");
      expect(() =>
        assertStylesMatchAnatomy(folder, assertAnatomy(folder)),
      ).toThrow(
        /root spacing\.gap: css symbol:container\.gap\.default, anatomy symbol:container\.gap\.tight[\s\S]*root@hover typography\.color: css \(unbound\), anatomy symbol:color\.text\.muted/,
      );
    });

    it("refuses a stylesheet in another layer", () => {
      const folder = locate(DRIFTED, "WrongLayer");
      expect(() =>
        assertStylesheets({
          directory: folder,
          layer: "ds.components.global",
          externalTokens: EXTERNAL_TOKENS,
        }),
      ).toThrow(/paints in @layer ds\.prism, not ds\.components\.global/);
      expect(() =>
        assertScaffold(folder, { packageRoot: DRIFTED, testSuffix: "test" }),
      ).toThrow(/styles\.css does not open as the generator writes it/);
    });

    it("refuses a component folder with no anatomy", () => {
      expect(() =>
        assertScaffold(locate(DRIFTED, "MissingAnatomy"), {
          packageRoot: DRIFTED,
          testSuffix: "test",
        }),
      ).toThrow(/anatomy\.yaml is missing/);
    });

    it("refuses a read of a dimension primitive", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "DimensionRead"),
          layer: "ds.components.global",
        }),
      ).toThrow(/reads a --dimension-\* primitive/);
    });

    it("refuses a property that reads a token other than its component's own", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "DirectRead"),
          layer: "ds.components.global",
          externalTokens: EXTERNAL_TOKENS,
        }),
      ).toThrow(/color reads --color-text, not through a component token/);
    });

    it("refuses a primitive font weight, even one named as external", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "PrimitiveWeight"),
          layer: "ds.components.global",
          externalTokens: ["--typography-weight-bold"],
        }),
      ).toThrow(/reads a --typography-weight-\* primitive/);
    });

    it("refuses a grid whose gap is a container gap", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "ContainerGapGrid"),
          layer: "ds.components.global",
        }),
      ).toThrow(/"\.ds\.container-gap-grid" sets gap from a container gap/);
    });

    it("refuses a grid that sets no gap", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "GaplessGrid"),
          layer: "ds.components.global",
        }),
      ).toThrow(/"\.ds\.gapless-grid" lays out a grid and sets no gap/);
    });

    it("refuses a query threshold that is no whole group", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "OffGroupThreshold"),
          layer: "ds.components.global",
        }),
      ).toThrow(
        /"@container shell \(width < 900px\)" is not a whole-group query/,
      );
    });

    it("refuses a component token declared on :root", () => {
      expect(() =>
        assertStylesheets({
          directory: locate(DRIFTED, "RootToken"),
          layer: "ds.components.global",
        }),
      ).toThrow(/:root declares --root-token-gap/);
    });

    it("refuses a test suffix the package does not use", () => {
      expect(() =>
        assertScaffold(locate(CONFORMING, "Probe"), {
          packageRoot: CONFORMING,
          testSuffix: "tests",
        }),
      ).toThrow(/Probe\.tests\.tsx is missing/);
    });
  });
});
