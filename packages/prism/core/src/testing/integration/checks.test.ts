// @vitest-environment node

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAnatomyYAML } from "@canonical/anatomy-dsl";
import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import {
  PROJECTED_ANATOMY,
  PROJECTED_FRAGMENT,
  SWITCHED_ANATOMY,
  SWITCHED_FRAGMENT,
} from "../../../testing/fixtures.js";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
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
      ).toEqual([
        locate(CONFORMING, "Probe"),
        locate(CONFORMING, "ScaffoldedProbe"),
      ]);
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

  describe("on a component the next generator release scaffolds", () => {
    const folder = locate(CONFORMING, "ScaffoldedProbe");

    it("passes the scaffold check with the Scaffolded by banner", () => {
      expect(() =>
        assertScaffold(folder, { packageRoot: CONFORMING, testSuffix: "test" }),
      ).not.toThrow();
    });

    it("refuses a banner that names another generator", () => {
      expect(() =>
        assertScaffold(locate(DRIFTED, "ForeignBanner"), {
          packageRoot: DRIFTED,
          testSuffix: "test",
        }),
      ).toThrow(/ForeignBanner\.tsx does not open with the generator's banner/);
    });
  });

  describe("on a component grouped under a library's subject folder", () => {
    it("passes the scaffold check one folder below src/lib", () => {
      expect(() =>
        assertScaffold(
          join(CONFORMING, "src", "lib", "probes", "SubjectProbe"),
          { packageRoot: CONFORMING, testSuffix: "test" },
        ),
      ).not.toThrow();
    });

    it("refuses a folder two levels below src/lib", () => {
      expect(() =>
        assertScaffold(
          join(DRIFTED, "src", "lib", "probes", "deep", "DeepProbe"),
          { packageRoot: DRIFTED, testSuffix: "test" },
        ),
      ).toThrow(
        /src\/lib\/probes\/deep\/DeepProbe is not a component placement/,
      );
    });
  });

  describe("assertProjectionMatchesFragment", () => {
    const specification = parseAnatomyYAML(PROJECTED_ANATOMY);

    it("passes when the anatomy and the fragment read the same fields", () => {
      expect(() =>
        assertProjectionMatchesFragment(specification, PROJECTED_FRAGMENT),
      ).not.toThrow();
    });

    it("names the path each side reads and the other does not", () => {
      const withoutCurie: ReaderFragment = {
        ...PROJECTED_FRAGMENT,
        selections: PROJECTED_FRAGMENT.selections.map((selection) =>
          selection.kind === "LinkedField" && selection.name === "_meta"
            ? {
                ...selection,
                selections: selection.selections.filter(
                  (inner) =>
                    !(inner.kind === "ScalarField" && inner.name === "curie"),
                ),
              }
            : selection,
        ),
      };
      const withoutParent = {
        root: {
          ...specification.root,
          edges: specification.root.edges?.filter(
            (edge) => edge.relation.slotName !== "parent",
          ),
        },
      };
      expect(() =>
        assertProjectionMatchesFragment(withoutParent, withoutCurie),
      ).toThrow(
        /the anatomy reads _meta\.curie, which ClassProbe_node does not\nClassProbe_node reads superclass\._meta\.title, which the anatomy does not/,
      );
    });

    it("refuses a fragment on another type than the anatomy projects on", () => {
      expect(() =>
        assertProjectionMatchesFragment(specification, {
          ...PROJECTED_FRAGMENT,
          type: "Node",
        }),
      ).toThrow(
        /prism\.component\.class_probe projects on OntologyClass, but ClassProbe_node is on Node/,
      );
    });

    describe("through a switch, an inline fragment and a condition", () => {
      const switched = parseAnatomyYAML(SWITCHED_ANATOMY);

      it("passes when each case reads what the fragment reads under its type or condition", () => {
        expect(() =>
          assertProjectionMatchesFragment(switched, SWITCHED_FRAGMENT),
        ).not.toThrow();
      });

      it("names a case's field the fragment drops and a conditional field no case reads", () => {
        const withoutInlineFragment: ReaderFragment = {
          ...SWITCHED_FRAGMENT,
          selections: SWITCHED_FRAGMENT.selections.filter(
            (selection) => selection.kind !== "InlineFragment",
          ),
        };
        const withoutTitleCase = {
          root: {
            ...switched.root,
            edges: switched.root.edges?.map((edge) =>
              "cases" in edge.target
                ? {
                    ...edge,
                    target: {
                      ...edge.target,
                      cases: edge.target.cases.filter(
                        ({ node }) => node.projection?.field !== "_meta.title",
                      ),
                    },
                  }
                : edge,
            ),
          },
        };
        expect(() =>
          assertProjectionMatchesFragment(
            withoutTitleCase,
            withoutInlineFragment,
          ),
        ).toThrow(
          /the anatomy reads isAbstract, which SwitchProbe_node does not\nSwitchProbe_node reads _meta\.title, which the anatomy does not/,
        );
      });
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

    it("names a font-variant-caps that differs from its typography.variant.caps", () => {
      const folder = locate(DRIFTED, "StyleDrift");
      expect(() =>
        assertStylesMatchAnatomy(folder, assertAnatomy(folder)),
      ).toThrow(
        /\.label typography\.variant\.caps: css primitive:small-caps, anatomy primitive:all-small-caps/,
      );
    });

    it("refuses a reflow that re-values anything but placement, size, spacing, visibility or border width", () => {
      const folder = locate(DRIFTED, "StyleDrift");
      expect(() =>
        assertStylesMatchAnatomy(folder, assertAnatomy(folder)),
      ).toThrow(/\.label: a reflow re-values appearance\.border\.color/);
    });

    it("refuses a child chain that leaves the anatomy's path to its slot", () => {
      const folder = locate(DRIFTED, "StyleDrift");
      expect(() =>
        assertStylesMatchAnatomy(folder, assertAnatomy(folder)),
      ).toThrow(
        /"\.ds\.style-drift > \.label > \.link" does not follow the anatomy's path to \.link, \.ds\.style-drift > \.body > \.link/,
      );
    });

    it("refuses a descendant selector that reaches deeper than one child", () => {
      const folder = locate(DRIFTED, "StyleDrift");
      expect(() =>
        assertStylesMatchAnatomy(folder, assertAnatomy(folder)),
      ).toThrow(
        /"\.ds\.style-drift \.body \.link\[href\]:hover" reaches deeper than one child/,
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

    it("refuses a component folder with no stories, in any package", () => {
      expect(() =>
        assertScaffold(locate(DRIFTED, "MissingAnatomy"), {
          packageRoot: DRIFTED,
          testSuffix: "test",
        }),
      ).toThrow(/MissingAnatomy\.stories\.tsx is missing/);
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
