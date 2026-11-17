import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import silenceRenderErrors from "../../../../testing/silenceRenderErrors.js";
import RendererSwitch from "./RendererSwitch.js";
import type { RendererChoice } from "./types.js";

const renderers: readonly RendererChoice[] = [
  { id: "table", label: "Table", content: <p>the table</p> },
  { id: "cards", label: "Cards", content: <p>the cards</p> },
];

/** The switch's choice, a group named by the label it is given. */
const readChoice = (name = "Show machines as"): HTMLElement =>
  screen.getByRole("group", { name });

/** The renderer the choice holds pressed, by its name. */
const readPressed = (): string | null =>
  screen.getByRole("button", { pressed: true }).textContent;

describe("RendererSwitch", () => {
  it("offers each renderer as a button in a group named by its label, the first pressed", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    const buttons = within(readChoice()).getAllByRole("button");
    expect(
      buttons.map((button) => [
        button.textContent,
        button.getAttribute("aria-pressed"),
        button.getAttribute("type"),
      ]),
    ).toEqual([
      ["Table", "true", "button"],
      ["Cards", "false", "button"],
    ]);
    expect(buttons.at(0)).toHaveClass("primary");
    expect(buttons.at(1)).toHaveClass("secondary");
  });

  it("draws only the chosen renderer, in a region named for it", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    expect(screen.getByRole("region", { name: "Table" })).toHaveTextContent(
      "the table",
    );
    expect(screen.queryByRole("region", { name: "Cards" })).toBeNull();
    expect(screen.queryByText("the cards")).toBeNull();
  });

  it("places the choice after the renderers", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    const region = screen.getByRole("region", { name: "Table" });
    expect(
      region.compareDocumentPosition(readChoice()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("draws the renderer pressed instead, keeping focus on its button", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    const cards = screen.getByRole("button", { name: "Cards" });
    cards.focus();
    fireEvent.click(cards);
    expect(cards).toHaveAttribute("aria-pressed", "true");
    expect(cards).toHaveFocus();
    expect(
      screen.getByRole("button", { name: "Table", pressed: false }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Cards" })).toHaveTextContent(
      "the cards",
    );
    expect(screen.queryByText("the table")).toBeNull();
  });

  it("changes nothing when the pressed button is pressed again", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    const table = screen.getByRole("button", { name: "Table" });
    table.focus();
    fireEvent.click(table);
    expect(readPressed()).toBe("Table");
    expect(screen.getByText("the table")).toBeInTheDocument();
    expect(table).toHaveFocus();
  });

  it("presses the button of the renderer it draws, and no other", () => {
    render(<RendererSwitch label="Show machines as" renderers={renderers} />);
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    expect(screen.getAllByRole("button", { pressed: true })).toHaveLength(1);
    expect(readPressed()).toBe(
      screen.getByRole("region", { name: "Cards" }).getAttribute("aria-label"),
    );
  });

  it("returns to the first renderer when the chosen one is no longer offered", () => {
    const { rerender } = render(
      <RendererSwitch label="Show machines as" renderers={renderers} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    rerender(
      <RendererSwitch
        label="Show machines as"
        renderers={renderers.filter((renderer) => renderer.id !== "cards")}
      />,
    );
    expect(readPressed()).toBe("Table");
    expect(screen.getByText("the table")).toBeInTheDocument();
  });

  it("names its root by its label, spreading and merging the caller's props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <RendererSwitch
        label="Show machines as"
        renderers={renderers}
        className="mine"
        data-testid="switch"
        ref={ref}
      />,
    );
    const root = screen.getByTestId("switch");
    expect(root.tagName).toBe("SECTION");
    expect(root).toHaveAccessibleName("Show machines as");
    expect(root).toHaveClass("ds", "renderer-switch", "mine");
    expect(ref.current).toBe(root);
  });

  it("names itself and its choice from the words where nothing names it", () => {
    render(<RendererSwitch renderers={renderers} />);
    expect(readChoice("Show as")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Show as" })).toBeInTheDocument();
  });

  it("speaks the application's own word for its name", () => {
    render(
      <RendererSwitch
        renderers={renderers}
        messages={{ renderer: "Afficher comme" }}
      />,
    );
    expect(readChoice("Afficher comme")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Afficher comme" }),
    ).toBeInTheDocument();
  });

  it("throws without a renderer to show", () => {
    silenceRenderErrors();
    expect(() =>
      render(<RendererSwitch label="Show machines as" renderers={[]} />),
    ).toThrow("RendererSwitch requires at least one renderer");
  });

  it("throws when two renderers share an id", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <RendererSwitch
          label="Show machines as"
          renderers={[
            { id: "table", label: "Table", content: null },
            { id: "table", label: "Another table", content: null },
          ]}
        />,
      ),
    ).toThrow("RendererSwitch requires a distinct id for each renderer");
  });
});

describe("RendererSwitch hydrating what the server drew", () => {
  const tree = (
    <RendererSwitch label="Show machines as" renderers={renderers} />
  );

  it("hydrates without a mismatch, then offers the choice over the first renderer alone", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    const recovered = vi.fn();
    await act(async () => {
      const root = hydrateRoot(container, tree, {
        onRecoverableError: recovered,
      });
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(recovered).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(readPressed()).toBe("Table");
    expect(screen.getByText("the table")).toBeInTheDocument();
    expect(screen.queryByText("the cards")).toBeNull();
  });
});

describe("RendererSwitch hydrating with the focus elsewhere", () => {
  /** The switch's markup as a server draws it, in the page. */
  const drawServerMarkup = (): HTMLElement => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      <RendererSwitch label="Show machines as" renderers={renderers} />,
    );
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    return container;
  };

  /** Hydrate that markup, as a browser does once its scripts arrive. */
  const hydrate = async (container: HTMLElement): Promise<void> => {
    await act(async () => {
      const root = hydrateRoot(
        container,
        <RendererSwitch label="Show machines as" renderers={renderers} />,
      );
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
  };

  it("keeps the first renderer when nothing holds the focus", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const container = drawServerMarkup();
    expect(document.activeElement).toBe(document.body);
    await hydrate(container);
    expect(errors).not.toHaveBeenCalled();
    expect(readPressed()).toBe("Table");
    expect(screen.getByText("the table")).toBeInTheDocument();
    expect(screen.queryByText("the cards")).toBeNull();
  });

  it("keeps the first renderer, and the focus, when the focus is outside the switch", async () => {
    const outside = document.createElement("button");
    outside.textContent = "elsewhere";
    document.body.append(outside);
    onTestFinished(() => {
      outside.remove();
    });
    const container = drawServerMarkup();
    outside.focus();
    await hydrate(container);
    expect(readPressed()).toBe("Table");
    expect(document.activeElement).toBe(outside);
  });
});
