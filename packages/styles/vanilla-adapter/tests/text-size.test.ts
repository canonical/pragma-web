import { describe, expect, it } from "vitest";
import {
  computed,
  differences,
  fontSizeRules,
  idsIn,
  isLayoutOutput,
  mixedPage,
  PRAGMA_BLOCK,
  reactComponentsCss,
  render,
  textSizeCss,
  VANILLA_BLOCK,
  VANILLA_VERSIONS,
  vanillaFontSizeRules,
} from "./support/pages.js";

/** An element whose own size is the token, to read what the token resolves to. */
const PROBE = `<span id="probe" style="font-size: var(--typography-text-primary-font-size)">x</span>`;

/**
 * Vanilla text at the default size and around it. `kept` is what stays at
 * Vanilla's size whatever the context: headings, and Vanilla's smaller text,
 * which is smaller already.
 */
const TEXT = {
  "t-p": { markup: `<p id="t-p">Paragraph</p>`, kept: false },
  "t-div": { markup: `<div id="t-div">Plain text</div>`, kept: false },
  "t-label": { markup: `<label id="t-label">Label</label>`, kept: false },
  "t-li": { markup: `<ul><li id="t-li">Item</li></ul>`, kept: false },
  "t-td": {
    markup: `<table><tbody><tr><td id="t-td">Cell</td></tr></tbody></table>`,
    kept: false,
  },
  "t-dt": {
    markup: `<dl><dt id="t-dt">Term</dt><dd id="t-dd">Definition</dd></dl>`,
    kept: false,
  },
  "t-dd": { markup: "", kept: false },
  "t-button": {
    markup: `<button id="t-button">Bare button</button>`,
    kept: false,
  },
  "t-p-button": {
    markup: `<button class="p-button" id="t-p-button">Button</button>`,
    kept: false,
  },
  "t-input": {
    markup: `<input id="t-input" type="text" value="x">`,
    kept: false,
  },
  "t-select": {
    markup: `<select id="t-select"><option>a</option></select>`,
    kept: false,
  },
  "t-textarea": {
    markup: `<textarea id="t-textarea">x</textarea>`,
    kept: false,
  },
  "t-tab": {
    markup: `<div class="p-tabs"><a class="p-tabs__link" id="t-tab" href="#">Tab</a></div>`,
    kept: false,
  },
  "t-notification-title": {
    markup: `<div class="p-notification--information"><div class="p-notification__content"><h5 class="p-notification__title" id="t-notification-title">Title</h5><p class="p-notification__message" id="t-notification-message">Message</p></div></div>`,
    kept: false,
  },
  "t-notification-message": { markup: "", kept: false },
  "t-small-caps": {
    markup: `<p class="p-text--small-caps" id="t-small-caps">Caps</p>`,
    kept: false,
  },
  "t-small": {
    markup: `<p class="p-text--small" id="t-small">Small</p>`,
    kept: true,
  },
  "t-help": {
    markup: `<p class="p-form-help-text" id="t-help">Help</p>`,
    kept: true,
  },
  "t-small-button": {
    markup: `<button class="p-button is-small" id="t-small-button">Small</button>`,
    kept: true,
  },
  "t-expand-small": {
    markup: `<div class="p-side-navigation__expand"><button class="p-button--base is-small" id="t-expand-small">Small</button></div>`,
    kept: true,
  },
  "t-chip-lead": {
    markup: `<span class="p-chip"><span class="p-chip__lead" id="t-chip-lead">Lead</span></span>`,
    kept: true,
  },
  "t-h4": { markup: `<h4 id="t-h4">Heading 4</h4>`, kept: true },
  "t-h5": { markup: `<h5 id="t-h5">Heading 5</h5>`, kept: true },
  "t-h6": { markup: `<h6 id="t-h6">Heading 6</h6>`, kept: true },
  "t-p-h5": {
    markup: `<p class="p-heading--5" id="t-p-h5">Paragraph heading</p>`,
    kept: true,
  },
} as const;

const TEXT_BLOCK = Object.values(TEXT)
  .map((entry) => entry.markup)
  .join("\n");

/** Plain Vanilla children of a permeable pragma root, and a pragma card among them. */
const PERMEABLE_BLOCK = `
<div class="ds grid ds-permeable" id="perm-root">
  <div id="perm-div">Plain text</div>
  <p id="perm-p">Paragraph</p>
  <button class="p-button" id="perm-button">Button</button>
  <div class="ds card" id="perm-nested"><p id="perm-nested-p">nested</p></div>
</div>`;

/** Wherever text changes, the boxes it sits in change with it. */
const isSizeOrLayout = (property: string): boolean =>
  property === "font-size" || isLayoutOutput(property);

/** A Vanilla `1rem` rule that is a heading's, or the root's. */
const isHeadingOrRoot = (selectors: string[]): boolean =>
  selectors.some(
    (selector) =>
      selector === "html" ||
      /(^|[\s>+~])h[1-6](?![\w-])/.test(selector) ||
      selector.includes(".p-heading--"),
  );

/**
 * Selectors Vanilla sets to `1rem` and then, later and at the same
 * specificity, to `0.875rem`. Restating them would undo the correction.
 */
const CORRECTED = [
  ".p-chip--branded .p-chip__lead",
  ".p-chip--information .p-chip__lead",
  ".p-chip--negative .p-chip__lead",
  ".p-chip--caution .p-chip__lead",
  ".p-chip--positive .p-chip__lead",
  ".p-chip .p-chip__lead",
  ".p-navigation--reduced .p-navigation__logo-title",
];

/**
 * A selector whose restatement would tie, and win by order, against a later
 * `0.875rem` rule for a small variant of the same element. Mapped to that rule.
 */
const SHADOWING = {
  ".p-side-navigation__expand .p-button--base": ".is-small.p-button--base",
} as const;

const EXCLUDED = [...CORRECTED, ...Object.keys(SHADOWING)];

/**
 * Vanilla properties set in `em`: they follow the text by design, so where the
 * text changes they change in proportion to it.
 */
const EM_RELATIVE = new Set(["max-width", "max-inline-size", "letter-spacing"]);

/** Selectors in text-size.css that do not restate a Vanilla rule. */
const OWN = ["body", ":where(.ds-permeable > *)"];

const restated = new Set(
  fontSizeRules(textSizeCss).flatMap((rule) => rule.selectors),
);

/**
 * react-components' `1rem` selectors as text-size.css restates them, with the
 * component's class written twice.
 */
const reactComponentsRestated = fontSizeRules(reactComponentsCss)
  .filter((rule) => rule.value === "1rem")
  .flatMap((rule) => rule.selectors)
  .map((selector) => selector.replace(/^(\.[\w-]+)/, "$1$1"));

/**
 * react-components markup at the default size: each component's toggle or
 * frame, a control inside it, and text that inherits from them.
 */
const REACT_COMPONENTS_BLOCK = `
<div class="multi-select"><button class="multi-select__select-button" id="rc-ms-toggle"><span class="multi-select__condensed-text" id="rc-ms-text">a, b</span></button><input type="search" id="rc-ms-search"></div>
<div class="p-custom-select"><button class="p-custom-select__toggle" id="rc-cs-toggle">Choose</button><select id="rc-cs-select"><option>a</option></select></div>
<div class="p-prefixed-input"><div class="p-prefixed-input__flex-container" id="rc-pi-frame"><span class="p-prefixed-input__prefix" id="rc-pi-prefix">https://</span><input type="text" class="p-prefixed-input__input" id="rc-pi-input"></div></div>`;

describe.each(VANILLA_VERSIONS)("text-size.css (Vanilla %s)", (version) => {
  it.for([1280, 1700])(
    "gives Vanilla's default-size text the token's size under app at %ipx, and nothing else",
    async (width) => {
      const body = PROBE + TEXT_BLOCK;
      const without = await render(
        mixedPage(version, { body, textSize: false }),
        width,
      );
      const withFile = await render(mixedPage(version, { body }), width);
      const root = computed(without, without.documentElement).fontSize;
      const token = computed(withFile, "probe").fontSize;
      // The case is not vacuous: under app the token is smaller than the root.
      expect(Number.parseFloat(token)).toBeLessThan(Number.parseFloat(root));
      expect(computed(withFile, withFile.documentElement).fontSize).toBe(root);
      expect(computed(withFile, withFile.body).fontSize).toBe(token);

      const sizes = Object.fromEntries(
        Object.entries(TEXT).map(([id, { kept }]) => {
          const before = computed(without, id).fontSize;
          const after = computed(withFile, id).fontSize;
          return [id, { before, after, kept }];
        }),
      );
      const wrong = Object.entries(sizes).flatMap(
        ([id, { before, after, kept }]) => {
          const expected = kept || before !== root ? before : token;
          return after === expected
            ? []
            : [
                `#${id} font-size: ${after}, expected ${expected} (was ${before})`,
              ];
        },
      );
      expect(wrong).toEqual([]);
      // Every element the fixture means to change was at the root size.
      for (const [id, { before, kept }] of Object.entries(sizes))
        if (!kept) expect(before, `#${id}`).toBe(root);

      const ratio = Number.parseFloat(token) / Number.parseFloat(root);
      const scales = (property: string, after: string, before: string) =>
        EM_RELATIVE.has(property) &&
        Math.abs(Number.parseFloat(after) / Number.parseFloat(before) - ratio) <
          0.001;
      const others = Object.keys(TEXT).flatMap((id) =>
        differences(
          `#${id}`,
          computed(withFile, id),
          computed(without, id),
          (property, after, before) =>
            isSizeOrLayout(property) || scales(property, after, before),
        ),
      );
      expect(others).toEqual([]);
    },
  );

  it.for([1280, 1700])("changes nothing under site at %ipx", async (width) => {
    const body = TEXT_BLOCK + VANILLA_BLOCK;
    const options = { body, root: "site comfortable light" };
    const without = await render(
      mixedPage(version, { ...options, textSize: false }),
      width,
    );
    const withFile = await render(mixedPage(version, options), width);
    const failures = [
      ...differences(
        "body",
        computed(withFile, withFile.body),
        computed(without, without.body),
      ),
      ...idsIn(body).flatMap((id) =>
        differences(`#${id}`, computed(withFile, id), computed(without, id)),
      ),
    ];
    expect(failures).toEqual([]);
  });

  it("does not reach a pragma island", async () => {
    const without = await render(mixedPage(version, { textSize: false }));
    const withFile = await render(mixedPage(version));
    const failures = idsIn(PRAGMA_BLOCK).flatMap((id) =>
      differences(`#${id}`, computed(withFile, id), computed(without, id)),
    );
    expect(failures).toEqual([]);
  });

  it("gives the plain children of a permeable root the token's size, and leaves a nested island alone", async () => {
    const body = PROBE + PERMEABLE_BLOCK;
    const without = await render(mixedPage(version, { body, textSize: false }));
    const withFile = await render(mixedPage(version, { body }));
    const token = computed(withFile, "probe").fontSize;
    for (const id of ["perm-div", "perm-p", "perm-button"])
      expect(computed(withFile, id).fontSize, `#${id}`).toBe(token);
    // The root's own height follows its children's text.
    const nested = ["perm-root", "perm-nested", "perm-nested-p"].flatMap((id) =>
      differences(
        `#${id}`,
        computed(withFile, id),
        computed(without, id),
        id === "perm-root" ? isLayoutOutput : undefined,
      ),
    );
    expect(nested).toEqual([]);
  });

  it("restates every one of Vanilla's 1rem text rules, bar the named exceptions", () => {
    const rules = vanillaFontSizeRules(version);
    const text = rules.filter(
      (rule) => rule.value === "1rem" && !isHeadingOrRoot(rule.selectors),
    );
    // Restated unconditionally, so none of them may sit in a media rule.
    expect(text.filter((rule) => rule.media.length > 0)).toEqual([]);
    const missing = text
      .flatMap((rule) => rule.selectors)
      .filter(
        (selector) => !restated.has(selector) && !EXCLUDED.includes(selector),
      );
    expect(missing).toEqual([]);
  });

  it("leaves out only selectors a later 0.875rem rule depends on", () => {
    const rules = vanillaFontSizeRules(version);
    const lastAt = (selector: string, value: string): number =>
      rules.findLastIndex(
        (rule) => rule.value === value && rule.selectors.includes(selector),
      );
    const later = (large: string, small: string): boolean => {
      const at = lastAt(large, "1rem");
      return at >= 0 && lastAt(small, "0.875rem") > at;
    };
    expect(CORRECTED.filter((selector) => !later(selector, selector))).toEqual(
      [],
    );
    expect(
      Object.entries(SHADOWING).filter(
        ([selector, small]) => !later(selector, small),
      ),
    ).toEqual([]);
    expect(EXCLUDED.filter((selector) => restated.has(selector))).toEqual([]);
  });
});

describe("text-size.css", () => {
  it("restates no selector that is not one of Vanilla's 1rem text rules", () => {
    const vanilla = new Set(
      VANILLA_VERSIONS.flatMap((version) =>
        vanillaFontSizeRules(version)
          .filter((rule) => rule.value === "1rem")
          .flatMap((rule) => rule.selectors),
      ),
    );
    const stray = [...restated].filter(
      (selector) =>
        !vanilla.has(selector) &&
        !OWN.includes(selector) &&
        !reactComponentsRestated.includes(selector),
    );
    expect(stray).toEqual([]);
  });

  it.for(["afterVanilla", "afterPragma"] as const)(
    "gives react-components' copies of Vanilla's input rules the token's size, with their CSS linked %s",
    async (position) => {
      const body = PROBE + REACT_COMPONENTS_BLOCK;
      const sheets = { [position]: [reactComponentsCss] };
      const without = await render(
        mixedPage("4.61", { body, ...sheets, textSize: false }),
      );
      const withFile = await render(mixedPage("4.61", { body, ...sheets }));
      const root = computed(without, without.documentElement).fontSize;
      const token = computed(withFile, "probe").fontSize;
      for (const id of idsIn(REACT_COMPONENTS_BLOCK)) {
        expect(computed(without, id).fontSize, `#${id} without`).toBe(root);
        expect(computed(withFile, id).fontSize, `#${id}`).toBe(token);
      }
    },
  );

  it("restates every one of react-components' 1rem rules, with the component's class written twice", () => {
    expect(reactComponentsRestated.length).toBeGreaterThan(0);
    expect(
      reactComponentsRestated.filter((selector) => !restated.has(selector)),
    ).toEqual([]);
  });

  it("sets every size from the token", () => {
    const rules = fontSizeRules(textSizeCss);
    expect(
      rules.filter(
        (rule) =>
          rule.value !== "var(--typography-text-primary-font-size, 1rem)",
      ),
    ).toEqual([]);
  });
});
