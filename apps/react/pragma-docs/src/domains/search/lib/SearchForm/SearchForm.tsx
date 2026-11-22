// Scaffolded by @canonical/summon-component:react v0.46.0

import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useRef,
} from "react";
import { useMessages } from "#i18n";
import type { SearchFormProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds search-form";

/** The key that brings the focus to the field from anywhere on the page. */
const FOCUS_KEY = "/";

/** The elements that take typed text, so a typed `/` stays theirs. */
const TEXT_ENTRY_TAGS: ReadonlySet<string> = new Set([
  "INPUT",
  "SELECT",
  "TEXTAREA",
]);

/** Whether `element` takes typed text. */
const isTextEntry = (element: Element | null): boolean =>
  element instanceof HTMLElement &&
  (element.isContentEditable || TEXT_ENTRY_TAGS.has(element.tagName));

/**
 * The strip's Search on the search route: a GET form whose field, named
 * `q`, carries the address's text, so submitting it loads the page for
 * the new text without scripting. The field is keyed by the text, so a
 * navigation to another text resets it. `/` typed anywhere but in a text
 * entry focuses the field; Escape in the field clears it, then leaves it.
 *
 * `import { SearchForm } from "./lib/index.js";`
 *
 * @note Impure: listens to the document's keys while mounted, and moves
 *   the focus and clears the field on the keys above.
 * @implements docs.component.search_form
 */
export default function SearchForm({
  text,
  className,
  ...props
}: SearchFormProps): ReactElement {
  const t = useMessages();
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== FOCUS_KEY || event.isComposing) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTextEntry(document.activeElement)) return;
      event.preventDefault();
      field.current?.focus();
    };
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, []);

  /**
   * Clear the field on Escape, or leave it when it is already empty.
   *
   * @note Impure: writes the field's value or blurs it.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const input = event.currentTarget;
    if (input.value === "") input.blur();
    else input.value = "";
  };

  return (
    <form
      aria-label={t("search.title")}
      method="get"
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <input
        aria-label={t("search.field")}
        className="input"
        defaultValue={text}
        key={text}
        name="q"
        onKeyDown={handleKeyDown}
        placeholder={t("search.placeholder")}
        ref={field}
        type="search"
      />
      <button className="ds button submit" type="submit">
        {t("search.submit")}
      </button>
    </form>
  );
}
