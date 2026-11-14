import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import QueryInput from "./QueryInput.js";

const render = (props: Record<string, unknown> = {}) =>
  renderToString(
    <QueryInput
      label="Filter machines"
      value="deployed"
      onValueChange={() => {}}
      options={[{ id: "status", label: "status" }]}
      {...props}
    />,
  );

describe("QueryInput SSR", () => {
  it("renders a plain search input for the host's GET form when it has a name", () => {
    const html = render({ name: "q" });
    const input = html.match(/<input[^>]*>/)?.at(0);
    expect(input).toContain('name="q"');
    expect(input).toContain('type="search"');
    expect(input).not.toContain("disabled");
    expect(html).not.toContain('role="toolbar"');
    expect(html).not.toContain('role="combobox"');
    expect(html).not.toContain('role="listbox"');
    expect(html).not.toContain("popover");
    expect(html).toContain('role="status"');
  });

  it("renders the entry inert without a name", () => {
    expect(render()).toMatch(/<input[^>]*disabled=""/);
  });

  it("renders the clear control as a link with clearHref, else inert", () => {
    expect(render({ clearHref: "?", clearLabel: "Clear" })).toContain(
      'href="?"',
    );
    expect(render({ onClear: () => {}, clearLabel: "Clear" })).toMatch(
      /<button[^>]*disabled=""[^>]*aria-label="Clear"|<button[^>]*aria-label="Clear"[^>]*disabled=""/,
    );
  });

  it("shows no placeholder while chips are held", () => {
    const html = render({
      placeholder: "Search",
      hiddenLabel: (count: number) => `+${count} more`,
      children: (
        // biome-ignore lint/a11y/noRedundantRoles: QueryChips sets the list role explicitly
        <ul role="list" aria-label="Filters">
          <li>status is deployed</li>
        </ul>
      ),
    });
    expect(html).not.toContain("placeholder=");
    expect(render({ placeholder: "Search" })).toContain('placeholder="Search"');
  });
});
