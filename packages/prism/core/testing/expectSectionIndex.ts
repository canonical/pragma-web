import { expect } from "vitest";
import { BAR_MIN_SECTIONS } from "../src/lib/ui/SectionedView/constants.js";

/** The level-2 headings the view draws itself: each section's and the index's label. */
const OWN_HEADINGS =
  ".ds.sectioned-view > .content > .section > h2.heading, .ds.sectioned-view > .aside > .contents > h2.label";

/**
 * Expect a rendered page to be a sectioned view whose section index and
 * section headings are exactly the sections given: `root` is or holds a
 * `SectionedView`; with three sections or more, every contents list under
 * `root` has one entry per section, in order, each a link titled with the
 * section's title to `#<id>`, and with fewer there is no contents list; the sections' level-2 headings come in the same order, each
 * with the section's id and title; each id is the id of that heading
 * alone; and every level-2 heading under `root` is a section's heading or
 * the index's label, since a section's own content starts at level 3. A
 * page given no section has no section heading.
 *
 * @param root - The rendered page, such as a `SectionedView`'s root.
 * @param sections - The sections the page was given, in order.
 * @throws An assertion error naming the first entry that differs.
 */
export default function expectSectionIndex(
  root: Element,
  sections: readonly { readonly id: string; readonly title: string }[],
): void {
  expect(
    root.matches(".ds.sectioned-view") ||
      root.querySelector(".ds.sectioned-view") !== null,
    "the page is a sectioned view",
  ).toBe(true);
  const lists = [...root.querySelectorAll(".ds.contents-list")];
  if (sections.length < BAR_MIN_SECTIONS) {
    expect(
      lists,
      "the contents lists of fewer than three sections",
    ).toHaveLength(0);
  } else {
    expect(lists.length).toBeGreaterThan(0);
  }
  const expected = sections.map(({ id, title }) => ({
    href: `#${id}`,
    title,
  }));
  for (const list of lists) {
    const entries = [...list.querySelectorAll(":scope > li > a")].map(
      (link) => ({
        href: link.getAttribute("href"),
        title: link.textContent,
      }),
    );
    expect(entries).toEqual(expected);
  }
  const headings = [
    ...root.querySelectorAll("section[aria-labelledby] > h2[id]"),
  ].map((heading) => ({ id: heading.id, title: heading.textContent }));
  expect(headings, "the section headings, in order").toEqual(
    sections.map(({ id, title }) => ({ id, title })),
  );
  const stray = [...root.querySelectorAll("h2")]
    .filter((heading) => !heading.matches(OWN_HEADINGS))
    .map((heading) => heading.textContent);
  expect(
    stray,
    "the level-2 headings that are neither a section's nor the index's label",
  ).toEqual([]);
  for (const { id } of sections) {
    const targets = [...root.querySelectorAll(`[id="${CSS.escape(id)}"]`)];
    expect(
      targets.map((target) => target.tagName),
      `the element with id "${id}"`,
    ).toEqual(["H2"]);
  }
}
