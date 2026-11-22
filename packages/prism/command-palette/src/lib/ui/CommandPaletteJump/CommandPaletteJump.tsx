// Scaffolded by @canonical/summon-component:react v0.46.0

import { RouterLink } from "@canonical/prism-core";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { useMessages } from "../../i18n/index.js";
import { ARROW_STEPS } from "../CommandPaletteSearch/constants.js";
import narrowDestinations from "./narrowDestinations.js";
import type { CommandPaletteJumpProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds command-palette-jump";

/**
 * Keep the focus in the field when a pointer presses the options: none of
 * them takes the focus, so the arrow keys and the typing keep reaching the
 * field. The press's click still follows the link it lands on.
 *
 * @note Impure: prevents the press's default action.
 */
const keepFieldFocus = (event: MouseEvent<HTMLElement>): void => {
  event.preventDefault();
};

/**
 * The palette on a site whose provider serves no search: a field that
 * narrows the site's own destinations, its places (the home of each
 * lens) and the pages read before, on the client, sending no query.
 * Nothing in it says search is missing: it reads "Jump to".
 *
 * It is the ARIA combobox pattern with a listbox popup, as the palette's
 * search is: the field is the combobox and keeps the focus; the arrow keys
 * move the highlighted option (`aria-activedescendant`), wrapping at both
 * ends, from none to the first (down) or the last (up); typing highlights
 * none; Enter follows the highlighted option's link, through the site's
 * router, and with none highlighted does nothing; a pointer moving over an
 * option highlights it. Escape is the dialog's.
 *
 * Native props reach the root `<div>`; a consumer `className` merges after
 * its own.
 *
 * `import { CommandPaletteJump } from "../CommandPaletteJump/index.js";`
 *
 * @implements prism.component.command_palette_jump
 * @note Impure: reads the translator in scope, scrolls and clicks the
 *   highlighted option's link, and prevents a pointer's press from moving
 *   the focus.
 */
export default function CommandPaletteJump({
  destinations,
  onChoose,
  initialText = "",
  className,
  ...props
}: CommandPaletteJumpProps): ReactElement {
  const t = useMessages();
  const listboxId = useId();
  const [text, setText] = useState(initialText);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const activeLink = useRef<HTMLAnchorElement>(null);
  const narrowed = text.trim();
  const groups = narrowDestinations(destinations, narrowed);
  const stops = groups.reduce(
    (count, group) => count + group.options.length,
    0,
  );
  const active =
    highlighted === null ? undefined : Math.min(highlighted, stops - 1);
  const listed = stops > 0;

  /**
   * Scroll the highlighted option into the options' view as the highlight
   * reaches it.
   *
   * @note Impure: scrolls the options.
   */
  const attachActiveOption = useCallback((option: HTMLLIElement | null) => {
    option?.scrollIntoView({ block: "nearest" });
  }, []);

  /**
   * Take the field's new text, and highlight no option.
   *
   * @note Impure: sets the component's state.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
    setHighlighted(null);
  };

  /**
   * Move the highlight with the arrow keys, wrapping at both ends, and
   * follow the highlighted option's link with Enter. While an input method
   * is composing text, every key is the input method's.
   *
   * @note Impure: sets the component's state, prevents the keys' default
   *   actions in the field, and clicks the highlighted option's link.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.nativeEvent.isComposing) return;
    const step = ARROW_STEPS.get(event.key);
    if (step !== undefined && stops > 0) {
      event.preventDefault();
      setHighlighted(
        active === undefined
          ? (stops + Math.min(step, 0)) % stops
          : (active + step + stops) % stops,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      activeLink.current?.click();
    }
  };

  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <input
        aria-activedescendant={
          active === undefined ? undefined : `${listboxId}-${active}`
        }
        aria-autocomplete="list"
        aria-controls={listed ? listboxId : undefined}
        aria-expanded={listed}
        aria-label={t("palette.jumpTo")}
        autoComplete="off"
        className="query"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t("jump.placeholder")}
        role="combobox"
        spellCheck={false}
        type="text"
        value={text}
      />
      {listed ? (
        <div
          aria-label={t("jump.results")}
          className="results"
          id={listboxId}
          onMouseDown={keepFieldFocus}
          role="listbox"
          tabIndex={-1}
        >
          {groups.map((group) => {
            const headingId = `${listboxId}-${group.heading}`;
            return (
              // biome-ignore lint/a11y/useSemanticElements: a listbox groups its options with role="group", which a fieldset, a form control group, does not carry.
              <ul
                aria-labelledby={headingId}
                className="group"
                key={group.heading}
                role="group"
              >
                <li className="heading" id={headingId} role="presentation">
                  {t(group.heading)}
                </li>
                {group.options.map(({ destination, index }) => (
                  <li
                    aria-selected={index === active}
                    className={index === active ? "option is-active" : "option"}
                    id={`${listboxId}-${index}`}
                    key={`${group.heading}-${destination.href}`}
                    onPointerMove={() => setHighlighted(index)}
                    ref={index === active ? attachActiveOption : undefined}
                    // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a listbox's options are its list's items, as the palette's search rows are.
                    role="option"
                    tabIndex={-1}
                  >
                    <RouterLink
                      className="link"
                      href={destination.href}
                      onClick={onChoose}
                      ref={index === active ? activeLink : undefined}
                      tabIndex={-1}
                    >
                      {destination.label}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      ) : (
        <output className="status">
          {narrowed === ""
            ? t("jump.hint")
            : t("jump.empty", { text: narrowed })}
        </output>
      )}
    </div>
  );
}
