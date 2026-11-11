import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Suggestions from "./Suggestions.js";
import type { PromptInputSuggestionGroup } from "./types.js";
import { getOptionId } from "./utils.js";

const GROUPS: PromptInputSuggestionGroup[] = [
  {
    id: "articles",
    label: "Articles",
    items: [
      {
        id: "hotfix",
        label: "Hotfix policy",
        tags: ["Desktop", "Server", "Core", "Cloud"],
      },
      { id: "apparmor", label: "AppArmor", tags: ["Desktop"] },
    ],
  },
  { id: "empty", label: "Empty", items: [] },
];

describe("Suggestions component", () => {
  it("renders labelled groups of options", () => {
    render(<Suggestions id="list" groups={GROUPS} onSelect={() => {}} />);
    const group = screen.getByRole("group", { name: "Articles" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("leaves out groups without items", () => {
    render(<Suggestions id="list" groups={GROUPS} onSelect={() => {}} />);
    expect(
      screen.queryByRole("group", { name: "Empty" }),
    ).not.toBeInTheDocument();
  });

  it("shows two tags and counts the rest", () => {
    render(<Suggestions id="list" groups={GROUPS} onSelect={() => {}} />);
    const option = screen.getByRole("option", { name: /Hotfix policy/ });
    expect(option).toHaveTextContent("Desktop");
    expect(option).toHaveTextContent("Server");
    expect(option).not.toHaveTextContent("Core");
    expect(option).toHaveTextContent("+2");
  });

  it("marks the active option as selected", () => {
    render(
      <Suggestions
        id="list"
        groups={GROUPS}
        activeOptionId={getOptionId("list", 0, 1)}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByRole("option", { name: /AppArmor/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("option", { name: /Hotfix policy/ }),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelect with the clicked option and its group", () => {
    const onSelect = vi.fn();
    render(<Suggestions id="list" groups={GROUPS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("option", { name: /AppArmor/ }));
    expect(onSelect).toHaveBeenCalledWith(GROUPS[0].items[1], GROUPS[0]);
  });
});
