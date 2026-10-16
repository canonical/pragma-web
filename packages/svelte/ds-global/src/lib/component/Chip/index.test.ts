import { readFileSync } from "node:fs";
import type { ComponentProps } from "svelte";
import ts from "typescript";
import { describe, expect, expectTypeOf, it } from "vitest";
import Dismiss from "./common/Dismiss/Dismiss.svelte";
import type { ChipDismissProps } from "./index.js";
import { Chip } from "./index.js";

describe("Chip exports", () => {
  it("exposes the dismiss component with its native button props", () => {
    expect(Chip.Dismiss).toBe(Dismiss);
    expectTypeOf<
      ComponentProps<typeof Chip.Dismiss>
    >().toEqualTypeOf<ChipDismissProps>();
  });

  it("preserves the dismiss documentation and usage example in declarations", () => {
    const source = readFileSync(new URL("./index.ts", import.meta.url), "utf8");
    const { outputText, diagnostics } = ts.transpileDeclaration(source, {
      fileName: "index.ts",
      compilerOptions: {
        module: ts.ModuleKind.NodeNext,
        target: ts.ScriptTarget.ESNext,
      },
    });

    expect(diagnostics).toEqual([]);
    const declaration = ts.createSourceFile(
      "index.d.ts",
      outputText,
      ts.ScriptTarget.Latest,
      true,
    );
    const dismiss = findDismissDeclaration(declaration);
    expect(dismiss).toBeDefined();
    if (!dismiss) {
      throw new Error("Chip.Dismiss is missing from the emitted declaration");
    }

    const documentation = ts
      .getJSDocCommentsAndTags(dismiss)
      .map((comment) => comment.getText(declaration))
      .join("\n");

    expect(documentation).toContain("@example");
    expect(documentation).toContain("<Chip.Dismiss");
    expect(documentation).toContain("onclick=");
    expect(documentation).toContain("disabled=");
    expect(documentation).toContain("aria-label=");
  });
});

function findDismissDeclaration(
  node: ts.Node,
): ts.PropertySignature | undefined {
  if (
    ts.isPropertySignature(node) &&
    ts.isIdentifier(node.name) &&
    node.name.text === "Dismiss"
  ) {
    return node;
  }
  return ts.forEachChild(node, findDismissDeclaration);
}
