import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Field from "../../lib/pattern/Field/Field.svelte";
import { goldenCases } from "../fixtures.goldenCases.js";
import { reactGolden } from "../fixtures.reactGolden.js";
import normalizeMarkup from "../normalizeMarkup.js";

/** React prop names that Svelte spells as the native attribute. */
const SVELTE_PROP_NAMES: Record<string, string> = {
  autoComplete: "autocomplete",
};

/** Maps a golden case to the props of the Svelte Field. */
function createSvelteProps(key: string) {
  const { props, error } = goldenCases[key];
  return Object.fromEntries([
    ...Object.entries(props).map(([name, value]) => [
      SVELTE_PROP_NAMES[name] ?? name,
      value,
    ]),
    ...(error ? [["error", error]] : []),
  ]);
}

describe("React markup parity", () => {
  const { window } = render(Field, {
    props: { inputType: "text", name: "probe" },
  });

  it.each(Object.keys(goldenCases))("renders the %s markup", (key) => {
    const svelte = render(Field, {
      // biome-ignore lint/suspicious/noExplicitAny: golden props are data
      props: createSvelteProps(key) as any,
    });
    const react = window.document.createElement("div");
    react.innerHTML = reactGolden[key];
    expect(normalizeMarkup(svelte.container)).toBe(normalizeMarkup(react));
  });

  it("covers every shipped input type", () => {
    const covered = new Set(
      Object.values(goldenCases).map(({ props }) => props.inputType),
    );
    expect([...covered].sort()).toEqual(
      [
        "checkbox",
        "choices",
        "color",
        "date",
        "datetime",
        "email",
        "file",
        "hidden",
        "number",
        "password",
        "phone",
        "range",
        "rating",
        "rich-choices",
        "select",
        "switch",
        "tel",
        "text",
        "textarea",
        "time",
        "url",
      ].sort(),
    );
  });

  it("has a captured React rendering for every case", () => {
    expect(Object.keys(reactGolden).sort()).toEqual(
      Object.keys(goldenCases).sort(),
    );
  });
});
