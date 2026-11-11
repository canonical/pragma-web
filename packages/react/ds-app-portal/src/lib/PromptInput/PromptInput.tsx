import {
  Button,
  TooltipEngine,
  type WithTooltipOptions,
} from "@canonical/react-ds-global";
import { TextareaInput } from "@canonical/react-ds-global-form";
import type React from "react";
import { type FocusEvent, type KeyboardEvent, useId, useState } from "react";
import { getOptionId, Suggestions } from "./common/index.js";
import { DEFAULT_MESSAGES } from "./constants.js";
import type { PromptInputProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds prompt-input";

// The submit button sits at the inline end, so its tooltip opens above and
// grows back towards the start, keeping it inside the field.
const TOOLTIP_DIRECTIONS: WithTooltipOptions["preferredDirections"] = [
  { side: "block-start", align: "end" },
  { side: "block-end", align: "end" },
];

/**
 * A prompt field for asking a question: a multi-line textarea, optional
 * controls and a submit button. Enter submits the form and Shift + Enter
 * starts a new line; a tooltip on the submit button says so.
 *
 * While the field has focus it lists any `suggestions` under it. The arrow
 * keys move through them, Enter picks the highlighted one and Escape closes
 * the list.
 *
 * `import { PromptInput } from "@canonical/react-ds-app-portal";`
 */
const PromptInput = ({
  className,
  placeholder,
  compactPlaceholder,
  messages: messagesProp,
  controls,
  suggestions = [],
  onSuggestionSelect,
  onFocus,
  onBlur,
  ...props
}: PromptInputProps): React.ReactElement => {
  const messages = { ...DEFAULT_MESSAGES, ...messagesProp };
  const listboxId = useId();
  const [hasFocus, setHasFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string>();

  const options = suggestions.flatMap((group, groupIndex) =>
    group.items.map((item, itemIndex) => ({
      id: getOptionId(listboxId, groupIndex, itemIndex),
      item,
      group,
    })),
  );
  const isOpen = hasFocus && !dismissed && options.length > 0;
  // An id left over from an earlier list matches nothing, so no row is lit.
  const activeOption = isOpen
    ? options.find((option) => option.id === activeOptionId)
    : undefined;

  const close = (): void => {
    setDismissed(true);
    setActiveOptionId(undefined);
  };

  const handleFocus = (event: FocusEvent<HTMLFormElement>): void => {
    setHasFocus(true);
    onFocus?.(event);
  };

  // Focus moving between the textarea and the controls keeps the list open.
  const handleBlur = (event: FocusEvent<HTMLFormElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasFocus(false);
      setDismissed(false);
      setActiveOptionId(undefined);
    }
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const index = activeOption ? options.indexOf(activeOption) : -1;
      const next =
        index === -1
          ? step === 1
            ? 0
            : options.length - 1
          : (index + step + options.length) % options.length;
      setActiveOptionId(options[next].id);
      return;
    }
    if (isOpen && event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    // Shift + Enter keeps the textarea's native new line, and Enter is left
    // alone while an input method is composing, where it confirms the text.
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    if (activeOption) {
      onSuggestionSelect?.(activeOption.item, activeOption.group);
      close();
      return;
    }
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      <TextareaInput
        className="prompt"
        name="prompt"
        aria-label={messages.prompt}
        aria-autocomplete={options.length > 0 ? "list" : undefined}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={activeOption?.id}
        placeholder={placeholder}
        rows={2}
        onKeyDown={handleKeyDown}
        onChange={() => {
          setDismissed(false);
          setActiveOptionId(undefined);
        }}
      />
      {/* The native placeholder can't change with width, so this draws both hints over it. */}
      {placeholder && compactPlaceholder ? (
        <div className="placeholder" aria-hidden="true">
          <span className="full">{placeholder}</span>
          <span className="compact">{compactPlaceholder}</span>
        </div>
      ) : null}
      <div className="actions">
        {controls}
        <TooltipEngine
          Message={
            <>
              {messages.sendShortcut}
              <br />
              {messages.newLineShortcut}
            </>
          }
          preferredDirections={TOOLTIP_DIRECTIONS}
          autoFit
        >
          <Button
            type="submit"
            icon="chevron-right"
            aria-label={messages.submit}
          />
        </TooltipEngine>
      </div>
      {isOpen ? (
        <Suggestions
          id={listboxId}
          aria-label={messages.suggestions}
          groups={suggestions}
          activeOptionId={activeOption?.id}
          onSelect={(item, group) => {
            onSuggestionSelect?.(item, group);
            close();
          }}
        />
      ) : null}
    </form>
  );
};

export default PromptInput;
