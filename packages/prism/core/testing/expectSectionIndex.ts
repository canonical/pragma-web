import { expect } from "vitest";

/**
 * Expect a rendered page to be a sectioned view whose section index and
 * section headings are exactly the sections given: `root` is or holds a
 * `SectionedView`; every contents list under `root` has one entry per
 * section, in order, each a link titled with the section's title to
 * `#<id>`; the sections' level-2 headings come in the same order, each
 * with the section's id and title; and each id is the id of that heading
 * alone. A page given no section has no contents list and no section
 * heading.
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
  if (sections.length === 0) {
    expect(lists).toHaveLength(0);
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
  for (const { id } of sections) {
    const targets = [...root.querySelectorAll(`[id="${CSS.escape(id)}"]`)];
    expect(
      targets.map((target) => target.tagName),
      `the element with id "${id}"`,
    ).toEqual(["H2"]);
  }
}
