import { describe, expect, it } from "vitest";
import {
  computed,
  differences,
  idsIn,
  isLayoutOutput,
  mixedPage,
  render,
  VANILLA_BLOCK,
  VANILLA_VERSIONS,
  vanillaPage,
} from "./support/pages.js";

/**
 * The document is pinned `light` from day one (README rule 4), and the Vanilla-
 * only page, the site before pragma, carries no pin: `color-scheme` differs by
 * design on every element. The pin itself is asserted in theme.test.ts.
 */
const isPin = (property: string): boolean => property === "color-scheme";

/** The root and the body also differ in the size their content gives them. */
const isPinOrContent = (property: string): boolean =>
  isPin(property) || isLayoutOutput(property);

describe.each(VANILLA_VERSIONS)(
  "vanilla-territory-untouched (Vanilla %s)",
  (version) => {
    // Under app, adapter.css gives Vanilla's default-size text the context's
    // text size (text-size.test.ts). These cases leave those rules out, so that
    // they see the boundary alone; the site case keeps them, because under site
    // they change nothing.
    const TEXT_SIZE_APART = { textSize: false } as const;

    it("is not changed by adapter.css, text size apart", async () => {
      const withAdapter = await render(mixedPage(version, TEXT_SIZE_APART));
      const without = await render(mixedPage(version, { adapter: "none" }));
      const failures = idsIn(VANILLA_BLOCK).flatMap((id) =>
        differences(`#${id}`, computed(withAdapter, id), computed(without, id)),
      );
      expect(failures).toEqual([]);
    });

    it("is not changed by adapter.css at all under site", async () => {
      const root = "site comfortable light";
      const withAdapter = await render(mixedPage(version, { root }));
      const without = await render(
        mixedPage(version, { root, adapter: "none" }),
      );
      const failures = [
        ...differences(
          "body",
          computed(withAdapter, withAdapter.body),
          computed(without, without.body),
          isLayoutOutput,
        ),
        ...idsIn(VANILLA_BLOCK).flatMap((id) =>
          differences(
            `#${id}`,
            computed(withAdapter, id),
            computed(without, id),
          ),
        ),
      ];
      expect(failures).toEqual([]);
    });

    it("keeps Vanilla's root rules and custom properties", async () => {
      const mixed = await render(mixedPage(version));
      const root = computed(mixed, mixed.documentElement);
      expect(root.getPropertyValue("--vf-color-text-default").trim()).not.toBe(
        "",
      );
      expect(root.boxSizing).toBe("border-box");
    });

    it("keeps Vanilla's root line-height", async () => {
      // Pragma's reset is confined to the islands by elements.css, so Vanilla's
      // `html` rule stands on the document element.
      const mixed = await render(mixedPage(version));
      expect(computed(mixed, mixed.documentElement).lineHeight).toBe("24px");
    });

    it.for([1280, 1700])(
      "equals the Vanilla-only page for every longhand at %ipx, html and body included, text size apart",
      async (width) => {
        const mixed = await render(mixedPage(version, TEXT_SIZE_APART), width);
        const vanilla = await render(vanillaPage(version), width);
        const failures = [
          ...differences(
            "html",
            computed(mixed, mixed.documentElement),
            computed(vanilla, vanilla.documentElement),
            isPinOrContent,
          ),
          ...differences(
            "body",
            computed(mixed, mixed.body),
            computed(vanilla, vanilla.body),
            isPinOrContent,
          ),
          ...idsIn(VANILLA_BLOCK).flatMap((id) =>
            differences(
              `#${id}`,
              computed(mixed, id),
              computed(vanilla, id),
              isPin,
            ),
          ),
        ];
        expect(failures).toEqual([]);
      },
    );
  },
);
