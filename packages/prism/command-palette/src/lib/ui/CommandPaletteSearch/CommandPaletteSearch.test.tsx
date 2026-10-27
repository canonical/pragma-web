// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import answerSearch from "../../../../testing/answerSearch.js";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  COMPONENT_HREF,
  COMPONENT_NODE,
  ONTOLOGY_CLASS_HREF,
  RANKED_RESULTS,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import CommandPaletteSearch from "./CommandPaletteSearch.js";

/** Render the search under the site's providers. */
const renderSearch = () => {
  const environment = createSearchEnvironment();
  const router = createSiteRouter();
  const onChoose = vi.fn();
  const view = render(
    createSiteTree({
      environment,
      router,
      children: (
        <Suspense fallback={null}>
          <CommandPaletteSearch onChoose={onChoose} session={0} />
        </Suspense>
      ),
    }),
  );
  return { ...view, environment, router, onChoose };
};

/** Type `text` in the field. */
const type = (text: string): void => {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: text } });
};

/**
 * Render the search, type `text`, and answer the search it sends with
 * `nodes`, waiting until the answer is listed.
 */
const renderResults = async (
  text: string,
  nodes: readonly NodePayload[] = RANKED_RESULTS,
) => {
  const rendered = renderSearch();
  type(text);
  await act(async () => {
    rendered.environment.mock.resolveMostRecentOperation(answerSearch(nodes));
  });
  return rendered;
};

/** The option the field's active descendant names. */
const findActiveOption = (): HTMLElement => {
  const id = screen.getByRole("combobox").getAttribute("aria-activedescendant");
  const option = screen
    .getAllByRole("option")
    .find((candidate) => candidate.id === id);
  if (option === undefined) throw new Error("no option is active");
  return option;
};

/** The title of the option the field's active descendant names. */
const readActiveTitle = (): string | null | undefined =>
  findActiveOption().querySelector(".title")?.textContent;

/** The title of the card the preview shows. */
const readPreviewTitle = (): string | null =>
  within(screen.getByRole("region", { name: "Preview" })).getByRole("link")
    .textContent;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CommandPaletteSearch", () => {
  it("shows the hint and sends no query while the field is empty", () => {
    const { environment, container } = renderSearch();
    expect(within(container).getByRole("status")).toHaveTextContent(
      "Type a name, a compact address or a word from a definition.",
    );
    expect(screen.queryByRole("listbox")).toBeNull();
    const field = screen.getByRole("combobox", { name: "Search the graph" });
    expect(field).toHaveAttribute("aria-expanded", "false");
    expect(field).not.toHaveAttribute("aria-controls");
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });

  it("searches the trimmed text, one page of results", () => {
    const { environment } = renderSearch();
    type("  lay ");
    const operations = environment.mock.getAllOperations();
    expect(operations).toHaveLength(1);
    expect(operations.at(0)?.request.variables).toEqual({
      text: "lay",
      first: 20,
      searching: true,
    });
  });

  it("groups the results by type in rank order and highlights the first", async () => {
    await renderResults("lay");
    const listbox = screen.getByRole("listbox", { name: "Results" });
    const groups = within(listbox).getAllByRole("group");
    expect(
      groups.map((group) =>
        within(group)
          .getAllByRole("option")
          .map((option) => option.querySelector(".title")?.textContent),
      ),
    ).toEqual([["Layout switcher", "Player layout"], ["Layout"]]);
    const field = screen.getByRole("combobox");
    expect(field).toHaveAttribute("aria-expanded", "true");
    expect(field).toHaveAttribute("aria-controls", listbox.id);
    const first = screen.getAllByRole("option").at(0);
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(field).toHaveAttribute("aria-activedescendant", first?.id);
    expect(readPreviewTitle()).toBe("Layout switcher");
  });

  it("names each group by its type's heading", async () => {
    await renderResults("lay");
    expect(
      screen.getAllByRole("group").map((group) => {
        const heading = document.getElementById(
          group.getAttribute("aria-labelledby") ?? "",
        );
        return heading?.textContent;
      }),
    ).toEqual(["Component", "Class"]);
  });

  it("moves the highlight and the preview with the arrow keys, wrapping", async () => {
    await renderResults("lay");
    const field = screen.getByRole("combobox");
    expect(fireEvent.keyDown(field, { key: "ArrowDown" })).toBe(false);
    expect(findActiveOption()).toHaveTextContent("Player layout");
    expect(readPreviewTitle()).toBe("Player layout");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(findActiveOption()).toHaveTextContent("Layout");
    expect(readPreviewTitle()).toBe("Layout");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(findActiveOption()).toHaveTextContent("Layout switcher");
    expect(fireEvent.keyDown(field, { key: "ArrowUp" })).toBe(false);
    expect(findActiveOption()).toHaveTextContent("Layout");
    expect(screen.getAllByRole("option", { selected: true })).toHaveLength(1);
  });

  it("leaves the arrow keys to an input method while it composes text", async () => {
    await renderResults("lay");
    const field = screen.getByRole("combobox");
    for (const key of ["ArrowDown", "ArrowUp"]) {
      expect(fireEvent.keyDown(field, { key, isComposing: true })).toBe(true);
      expect(readActiveTitle()).toBe("Layout switcher");
    }
  });

  it("scrolls each newly highlighted result into the results' view", async () => {
    await renderResults("lay");
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    const field = screen.getByRole("combobox");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts.at(0)).toBe(findActiveOption());
    expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "nearest" });
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView.mock.contexts.at(1)).toBe(findActiveOption());
  });

  it("highlights the result a pointer moves over", async () => {
    await renderResults("lay");
    const options = screen.getAllByRole("option");
    fireEvent.pointerMove(options.at(2) as HTMLElement);
    expect(options.at(2)).toHaveAttribute("aria-selected", "true");
    expect(options.at(0)).toHaveAttribute("aria-selected", "false");
  });

  it("keeps the focus in the field when a pointer presses under it, but on a link", async () => {
    const { container } = await renderResults("lay");
    const field = screen.getByRole("combobox");
    field.focus();
    const heading = container.querySelector(".heading");
    if (heading === null) throw new Error("no group heading is rendered");
    expect(fireEvent.mouseDown(heading)).toBe(false);
    expect(
      fireEvent.mouseDown(screen.getByRole("region", { name: "Preview" })),
    ).toBe(false);
    expect(field).toHaveFocus();
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(findActiveOption()).toHaveTextContent("Player layout");
    const link = within(
      screen.getByRole("region", { name: "Preview" }),
    ).getByRole("link");
    expect(fireEvent.mouseDown(link)).toBe(true);
  });

  it("chooses the highlighted result with Enter, opening its home", async () => {
    const { router, onChoose } = await renderResults("lay");
    const field = screen.getByRole("combobox");
    fireEvent.keyDown(field, { key: "Enter", isComposing: true });
    expect(onChoose).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(field, { key: "Enter" })).toBe(false);
    expect(onChoose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe(COMPONENT_HREF);
    });
  });

  it("names the text nothing in the graph matches", async () => {
    const { container } = await renderResults("zzz", []);
    // The router announces each navigation in a status region of its own.
    expect(within(container).getByRole("status")).toHaveTextContent(
      "Nothing in the graph matches “zzz”.",
    );
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("region", { name: "Preview" })).toBeNull();
  });

  it("keeps the last results on screen, busy, while the next ones load", async () => {
    const { environment } = await renderResults("lay");
    type("layo");
    expect(environment.mock.getAllOperations()).toHaveLength(1);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await act(async () => {
      environment.mock.resolveMostRecentOperation(
        answerSearch([COMPONENT_NODE]),
      );
    });
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "false");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("highlights the first result again once the reader types", async () => {
    const { environment } = await renderResults("lay");
    const field = screen.getByRole("combobox");
    fireEvent.keyDown(field, { key: "ArrowDown" });
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(findActiveOption()).toHaveTextContent("Layout");
    type("layo");
    await act(async () => {
      environment.mock.resolveMostRecentOperation(answerSearch(RANKED_RESULTS));
    });
    const first = screen.getAllByRole("option").at(0);
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(field).toHaveAttribute("aria-activedescendant", first?.id);
    expect(readPreviewTitle()).toBe("Layout switcher");
  });

  it("keeps the highlight on the list when fewer results replace those it was on", async () => {
    const { environment } = await renderResults("lay");
    type("layo");
    fireEvent.pointerMove(screen.getAllByRole("option").at(2) as HTMLElement);
    await act(async () => {
      environment.mock.resolveMostRecentOperation(
        answerSearch([COMPONENT_NODE]),
      );
    });
    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-activedescendant",
      option.id,
    );
    expect(readPreviewTitle()).toBe("Layout switcher");
  });

  it.each([
    ["ArrowDown", "Layout switcher"],
    ["ArrowUp", "Player layout"],
  ])(
    "steps %s from the result the highlight was kept on when fewer results came",
    async (key, title) => {
      const { environment } = await renderResults("lay", [
        ...RANKED_RESULTS,
        STATION_NODE,
      ]);
      type("layo");
      fireEvent.pointerMove(screen.getAllByRole("option").at(3) as HTMLElement);
      await act(async () => {
        environment.mock.resolveMostRecentOperation(
          answerSearch(RANKED_RESULTS),
        );
      });
      expect(readActiveTitle()).toBe("Layout");
      fireEvent.keyDown(screen.getByRole("combobox"), { key });
      expect(readActiveTitle()).toBe(title);
    },
  );

  it("holds each row's title as text and links the preview's title home", async () => {
    await renderResults("lay");
    expect(within(screen.getByRole("listbox")).queryByRole("link")).toBeNull();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowUp" });
    const preview = screen.getByRole("region", { name: "Preview" });
    expect(
      within(preview).getByRole("link", { name: "Layout" }),
    ).toHaveAttribute("href", ONTOLOGY_CLASS_HREF);
  });

  it("chooses the result when the preview's link is followed, and only then", async () => {
    const { router, onChoose } = await renderResults("lay");
    const preview = screen.getByRole("region", { name: "Preview" });
    fireEvent.click(preview);
    expect(onChoose).not.toHaveBeenCalled();
    fireEvent.click(within(preview).getByRole("link"));
    expect(onChoose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe(COMPONENT_HREF);
    });
  });

  it("lists and previews a result its site gives no home, and Enter does nothing", async () => {
    const { router, onChoose } = await renderResults("layton", [STATION_NODE]);
    expect(screen.getByRole("option")).toHaveAttribute("aria-disabled", "true");
    expect(
      within(screen.getByRole("region", { name: "Preview" })).getByText(
        "Layton",
      ),
    ).toBeInTheDocument();
    const navigate = vi.spyOn(router, "navigate");
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onChoose).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("keeps the scrolling results and preview out of the tab order", async () => {
    await renderResults("lay");
    expect(screen.getByRole("listbox")).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("region", { name: "Preview" })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("leaves the arrow keys to the field while nothing is listed", () => {
    const { onChoose } = renderSearch();
    const field = screen.getByRole("combobox");
    expect(fireEvent.keyDown(field, { key: "ArrowDown" })).toBe(true);
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onChoose).not.toHaveBeenCalled();
    expect(field).not.toHaveAttribute("aria-activedescendant");
  });

  it("applies a custom className and passes through additional props", () => {
    const { container } = render(
      createSiteTree({
        environment: createSearchEnvironment(),
        router: createSiteRouter(),
        children: (
          <CommandPaletteSearch
            className="custom-class"
            data-testid="search"
            onChoose={() => undefined}
            session={0}
          />
        ),
      }),
    );
    expect(container.firstElementChild?.className).toBe(
      "ds command-palette-search custom-class",
    );
    expect(screen.getByTestId("search")).toBeInTheDocument();
  });
});
