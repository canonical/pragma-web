import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MESSAGES as TOGGLE_MESSAGES } from "./common/DeepThinkingToggle/constants.js";
import { DEFAULT_MESSAGES } from "./constants.js";
import { PromptInput, type PromptInputSuggestionGroup } from "./index.js";

const CUSTOM_SUBMIT = "Go";

describe("PromptInput component", () => {
  it("renders the prompt and the submit button", () => {
    render(<PromptInput />);
    expect(
      screen.getByRole("textbox", { name: DEFAULT_MESSAGES.prompt }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: DEFAULT_MESSAGES.submit }),
    ).toBeInTheDocument();
  });

  it("renders no controls unless they are passed", () => {
    render(<PromptInput />);
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("renders the controls that are passed", () => {
    render(<PromptInput controls={<PromptInput.DeepThinkingToggle />} />);
    expect(
      screen.getByRole("switch", { name: TOGGLE_MESSAGES.label }),
    ).toBeInTheDocument();
  });

  it("applies className to the root", () => {
    const { container } = render(<PromptInput className="test-class" />);
    expect(container.firstElementChild).toHaveClass(
      "ds",
      "prompt-input",
      "test-class",
    );
  });

  it("shows the placeholder", () => {
    render(<PromptInput placeholder="Ask something" />);
    expect(screen.getByPlaceholderText("Ask something")).toBeInTheDocument();
  });

  it("keeps the full placeholder on the textarea when a compact one is set", () => {
    const { container } = render(
      <PromptInput placeholder="Ask something" compactPlaceholder="Ask" />,
    );
    expect(screen.getByPlaceholderText("Ask something")).toBeInTheDocument();
    const overlay = container.querySelector(".placeholder");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toHaveTextContent("Ask");
  });

  it("renders no overlay without a compact placeholder", () => {
    const { container } = render(<PromptInput placeholder="Ask something" />);
    expect(container.querySelector(".placeholder")).not.toBeInTheDocument();
  });

  it("overrides messages", () => {
    render(<PromptInput messages={{ submit: CUSTOM_SUBMIT }} />);
    expect(screen.getByRole("button", { name: CUSTOM_SUBMIT })).toBeVisible();
  });

  it("submits the prompt and the switch state", () => {
    let data: FormData | undefined;
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      data = new FormData(event.currentTarget);
    });
    render(
      <PromptInput
        onSubmit={onSubmit}
        controls={<PromptInput.DeepThinkingToggle />}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(
      screen.getByRole("button", { name: DEFAULT_MESSAGES.submit }),
    );

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(data?.get("prompt")).toBe("Hello");
    expect(data?.get("deepThinking")).toBe("on");
  });

  it("submits on Enter", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(<PromptInput onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not submit on Shift + Enter", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );
    render(<PromptInput onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("describes the shortcuts in the submit button's tooltip", () => {
    render(<PromptInput />);
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveTextContent(DEFAULT_MESSAGES.sendShortcut);
    expect(tooltip).toHaveTextContent(DEFAULT_MESSAGES.newLineShortcut);
  });

  describe("suggestions", () => {
    const SUGGESTIONS: PromptInputSuggestionGroup[] = [
      {
        id: "history",
        label: "History",
        items: [
          { id: "files", label: "files" },
          { id: "hello", label: "hello" },
        ],
      },
      {
        id: "tickets",
        label: "Tickets",
        items: [{ id: "1", label: "Openstack problem" }],
      },
    ];

    const setup = () => {
      const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) =>
        event.preventDefault(),
      );
      const onSuggestionSelect = vi.fn();
      render(
        <PromptInput
          suggestions={SUGGESTIONS}
          onSubmit={onSubmit}
          onSuggestionSelect={onSuggestionSelect}
        />,
      );
      const textbox = screen.getByRole("textbox");
      return { onSubmit, onSuggestionSelect, textbox };
    };

    it("are hidden until the field has focus", () => {
      const { textbox } = setup();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      fireEvent.focus(textbox);
      expect(
        screen.getByRole("listbox", { name: DEFAULT_MESSAGES.suggestions }),
      ).toBeInTheDocument();
      expect(textbox).toHaveAttribute(
        "aria-controls",
        screen.getByRole("listbox").id,
      );
    });

    it("close when focus leaves the field", () => {
      const { textbox } = setup();
      fireEvent.focus(textbox);
      fireEvent.blur(textbox, { relatedTarget: null });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("are not shown when there are none", () => {
      render(<PromptInput suggestions={[]} />);
      fireEvent.focus(screen.getByRole("textbox"));
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("move the highlight with the arrow keys, wrapping at the ends", () => {
      const { textbox } = setup();
      fireEvent.focus(textbox);
      const options = screen.getAllByRole("option");

      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      expect(textbox).toHaveAttribute("aria-activedescendant", options[0].id);
      expect(options[0]).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      expect(textbox).toHaveAttribute("aria-activedescendant", options[2].id);

      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      expect(textbox).toHaveAttribute("aria-activedescendant", options[0].id);

      fireEvent.keyDown(textbox, { key: "ArrowUp" });
      expect(textbox).toHaveAttribute("aria-activedescendant", options[2].id);
    });

    it("pick the highlighted suggestion on Enter instead of submitting", () => {
      const { textbox, onSubmit, onSuggestionSelect } = setup();
      fireEvent.focus(textbox);
      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      fireEvent.keyDown(textbox, { key: "ArrowDown" });
      fireEvent.keyDown(textbox, { key: "Enter" });

      expect(onSuggestionSelect).toHaveBeenCalledWith(
        SUGGESTIONS[0].items[1],
        SUGGESTIONS[0],
      );
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("still submit on Enter when nothing is highlighted", () => {
      const { textbox, onSubmit, onSuggestionSelect } = setup();
      fireEvent.focus(textbox);
      fireEvent.keyDown(textbox, { key: "Enter" });
      expect(onSubmit).toHaveBeenCalledOnce();
      expect(onSuggestionSelect).not.toHaveBeenCalled();
    });

    it("pick a suggestion on click", () => {
      const { textbox, onSuggestionSelect } = setup();
      fireEvent.focus(textbox);
      fireEvent.click(
        screen.getByRole("option", { name: "Openstack problem" }),
      );
      expect(onSuggestionSelect).toHaveBeenCalledWith(
        SUGGESTIONS[1].items[0],
        SUGGESTIONS[1],
      );
    });

    it("close on Escape and reopen when the prompt is edited", () => {
      const { textbox } = setup();
      fireEvent.focus(textbox);
      fireEvent.keyDown(textbox, { key: "Escape" });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      fireEvent.change(textbox, { target: { value: "h" } });
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });
});
