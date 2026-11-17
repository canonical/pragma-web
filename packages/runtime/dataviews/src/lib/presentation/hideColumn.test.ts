import { describe, expect, it } from "vitest";
import createPresentation from "./createPresentation.js";
import hideColumn from "./hideColumn.js";
import resolveColumnArrangement from "./resolveColumnArrangement.js";
import showColumn from "./showColumn.js";
import type { DeclaredColumn, ViewPresentation } from "./types.js";

const columns: readonly DeclaredColumn[] = [
  { id: "name", hideable: false },
  { id: "status" },
  { id: "cores" },
];

/** The ids an arrangement shows, in its order. */
const listShown = (
  declared: readonly DeclaredColumn[],
  presentation: ViewPresentation,
): readonly string[] =>
  resolveColumnArrangement(declared, presentation)
    .filter(({ hidden }) => !hidden)
    .map(({ column }) => column.id);

describe("hideColumn", () => {
  it("adds the column to the hidden list, keeping every id the list held", () => {
    const presentation = { "table.hidden": ["cores", "region", 7] };
    const patch = hideColumn({ columns, presentation, id: "status" });
    // A column another table declares stays hidden there.
    expect(patch).toEqual({ "table.hidden": ["cores", "region", "status"] });
    expect(listShown(columns, { ...presentation, ...patch })).toEqual(["name"]);
  });

  it("changes nothing for an unknown, hidden or unhideable column", () => {
    expect(hideColumn({ columns, presentation: {}, id: "region" })).toBeNull();
    expect(
      hideColumn({
        columns,
        presentation: { "table.hidden": ["cores"] },
        id: "cores",
      }),
    ).toBeNull();
    expect(hideColumn({ columns, presentation: {}, id: "name" })).toBeNull();
  });

  it("never hides the last column shown", () => {
    const hideable: readonly DeclaredColumn[] = [
      { id: "status" },
      { id: "cores" },
    ];
    const presentation = { "table.hidden": ["cores"] };
    expect(
      hideColumn({ columns: hideable, presentation, id: "status" }),
    ).toBeNull();
    // Nor the one a list naming every column leaves shown.
    expect(
      hideColumn({
        columns: hideable,
        presentation: { "table.hidden": ["status", "cores"] },
        id: "status",
      }),
    ).toBeNull();
  });

  /** Every declaration of three columns, each hideable or not. */
  const declarations = [0, 1, 2, 3, 4, 5, 6, 7].map((mask) => {
    const declared = ["a", "b", "c"].map((id, at) => ({
      id,
      hideable: (mask & (1 << at)) === 0,
    }));
    const fixed = declared
      .filter(({ hideable }) => !hideable)
      .map(({ id }) => id);
    return {
      declared,
      label:
        fixed.length === 0
          ? "every column hideable"
          : `${fixed.join(", ")} not hideable`,
    };
  });

  it.each(declarations)(
    "keeps a column shown and every unhideable column shown across every sequence of hides and shows, $label",
    ({ declared }) => {
      // Every sequence of four commands over the declaration, applied as a
      // presentation would apply each change. Each step is checked as plain
      // values and what it breaks recorded, so a failure names every broken
      // sequence rather than the first.
      const commands = declared.flatMap(({ id }) => [
        { kind: "hide", id } as const,
        { kind: "show", id } as const,
      ]);
      const listSequences = (length: number): (typeof commands)[number][][] =>
        length === 0
          ? [[]]
          : listSequences(length - 1).flatMap((sequence) =>
              commands.map((command) => [...sequence, command]),
            );
      const violations: string[] = [];
      let checked = 0;
      for (const sequence of listSequences(4)) {
        const owned = createPresentation();
        for (const [step, { kind, id }] of sequence.entries()) {
          const change = kind === "hide" ? hideColumn : showColumn;
          const patch = change({
            columns: declared,
            presentation: owned.state.get().presentation,
            id,
          });
          if (patch !== null) {
            owned.arrange(patch);
          }
          const arranged = resolveColumnArrangement(
            declared,
            owned.state.get().presentation,
          );
          // What is stored never hides every column it may, so the shown
          // column is the commands' doing, not the resolution's fallback.
          const stored = owned.state.get().presentation["table.hidden"];
          const storedHidden = Array.isArray(stored) ? stored : [];
          const broken = [
            arranged.some(({ hidden }) => !hidden) ? null : "no column shown",
            declared.some(
              (column) =>
                column.hideable === false || !storedHidden.includes(column.id),
            )
              ? null
              : "every column it may stored hidden",
            arranged.some(
              ({ column, hidden }) => column.hideable === false && hidden,
            )
              ? "an unhideable column hidden"
              : null,
          ];
          for (const reason of broken) {
            if (reason !== null) {
              const spelled = sequence
                .map((command) => `${command.kind} ${command.id}`)
                .join(", ");
              violations.push(`${spelled}, step ${step + 1}: ${reason}`);
            }
          }
          checked += 1;
        }
      }
      expect(violations).toEqual([]);
      expect(checked).toBe(6 ** 4 * 4);
    },
  );
});
