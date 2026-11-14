import { expect } from "vitest";

/**
 * Expect a rendered page's section index to list exactly the sections
 * given: every contents list under `root` has one entry per section, in
 * order, each a link titled with the section's title to `#<id>`, and each
 * id is the id of one level-2 heading under `root`. A page given no
 * section has no contents list.
 *
 * @param root - The rendered page, such as a `SectionedView`'s root.
 * @param sections - The sections the page was given, in order.
 * @throws An assertion error naming the first entry that differs.
 */
export default function expectSectionIndex(
  root: Element,
  sections: readonly { readonly id: string; readonly title: string }[],
): void {
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
  for (const { id } of sections) {
    const targets = [...root.querySelectorAll(`[id="${CSS.escape(id)}"]`)];
    expect(
      targets.map((target) => target.tagName),
      `the element with id "${id}"`,
    ).toEqual(["H2"]);
  }
}
