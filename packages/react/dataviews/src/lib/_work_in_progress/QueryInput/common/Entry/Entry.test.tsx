import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../../../common/Roving/index.js";
import Entry from "./Entry.js";

const getEntryProps = vi.fn((_entry, props) => ({
  ...props,
  role: "combobox",
}));

describe("Entry", () => {
  it("is a search input that submits with a name before scripts run", () => {
    const html = renderToString(
      <Entry
        isMounted={false}
        getEntryProps={getEntryProps}
        name="q"
        aria-label="Filter"
      />,
    );
    expect(html).toContain('type="search"');
    expect(html).not.toContain("disabled");
    expect(html).not.toContain("combobox");
  });

  it("is inert before scripts run without a name", () => {
    render(
      <Entry
        isMounted={false}
        getEntryProps={getEntryProps}
        aria-label="Filter"
      />,
    );
    expect(screen.getByRole("searchbox")).toBeDisabled();
  });

  it("is the combobox and the entry item once scripts run", () => {
    render(
      <RovingProvider activeItem="entry" onActiveItemChange={() => {}}>
        <Entry isMounted getEntryProps={getEntryProps} aria-label="Filter" />
      </RovingProvider>,
    );
    const entry = screen.getByRole("combobox", { name: "Filter" });
    expect(entry).toHaveAttribute("type", "text");
    expect(entry).toHaveAttribute("tabindex", "0");
    expect(getEntryProps).toHaveBeenCalledWith("own", expect.any(Object));
  });
});
