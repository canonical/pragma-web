import type { MouseEvent, ReactElement } from "react";
import { useId } from "react";
import { AssistiveText, ConditionMark } from "../../common/index.js";
import { useIsHydrated } from "../../hooks/index.js";
import { isPlainClick } from "../../utils/index.js";
import type { FilterOptionsOption, FilterOptionsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds filter-options";

/**
 * Filter options show one filter's values as words, beside its name, for a
 * filter of few values. Each word is a link where it has an address, so it
 * works before scripts run; the word that applies is marked current. With
 * one word at a time, they behave as a radio group whose first word is
 * usually "All"; with several, as checkboxes. While something applies, the
 * name carries the host's words for it and the mark of its Condition, and
 * an excluded value shows the Exclusion mark. Each word that leads
 * somewhere renders through `LinkComponent`, a router's link or an anchor.
 * Unlike **FilterButton**, the values show without opening anything.
 * Unlike **Chip**, a word offers a value rather than standing for one
 * applied.
 *
 * `import { FilterOptions } from "@canonical/dataviews-react";`
 *
 * @implements ds:global_dataviews.component.filter_options
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function FilterOptions({
  label,
  options,
  multiple = false,
  condition,
  appliedLabel,
  LinkComponent = "a",
  className,
  ...props
}: FilterOptionsProps): ReactElement {
  const labelId = useId();
  const hydrated = useIsHydrated();

  const renderWord = (option: FilterOptionsOption): ReactElement => {
    const { href, current, excludedLabel, count, onSelect } = option;
    const excluded = excludedLabel !== undefined;
    const wordClassName = ["word", excluded && "excluded"]
      .filter(Boolean)
      .join(" ");
    const text = (
      <>
        {excluded && <ConditionMark className="mark" condition="exclusion" />}
        {/* While excluded, the name says so in the host's words. */}
        {excluded ? (
          <>
            <span aria-hidden="true">{option.label}</span>
            <AssistiveText>{excludedLabel}</AssistiveText>
          </>
        ) : (
          option.label
        )}
        {count !== undefined && (
          <span className="count">
            {/* The comma reads the count apart from the word, unseen. */}
            <AssistiveText>, </AssistiveText>
            {count}
          </span>
        )}
      </>
    );
    const currentProps = current ? { "aria-current": true } : {};
    // Once scripts run, a plain click chooses in place; a new tab still
    // follows the address.
    const handleClick = (event: MouseEvent): void => {
      if (onSelect === undefined || !isPlainClick(event)) return;
      event.preventDefault();
      event.stopPropagation();
      onSelect();
    };
    if (href !== undefined && LinkComponent !== "a") {
      // A router's link takes only the shared contract's props, so the
      // choice in place is heard around it, before the router's own.
      return (
        <span className="link" onClickCapture={handleClick}>
          <LinkComponent
            href={href}
            className={wordClassName}
            {...currentProps}
          >
            {text}
          </LinkComponent>
        </span>
      );
    }
    if (href !== undefined) {
      return (
        <a
          className={wordClassName}
          href={href}
          {...currentProps}
          onClick={onSelect === undefined ? undefined : handleClick}
        >
          {text}
        </a>
      );
    }
    if (!hydrated) {
      // Nothing to lead to and nothing to run it: text, still marked.
      return (
        <span className={wordClassName} {...currentProps}>
          {text}
        </span>
      );
    }
    return (
      <button
        type="button"
        className={wordClassName}
        // A word among several toggles; one at a time is the current one.
        {...(multiple ? { "aria-pressed": current } : currentProps)}
        onClick={onSelect}
      >
        {text}
      </button>
    );
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: the words are links and buttons, not form controls, so a fieldset would claim a form that is not there
    <div
      {...props}
      role="group"
      aria-labelledby={labelId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <span id={labelId} className="label">
        {/* While something applies, one hidden span carries the whole
            name, so no browser spaces its comma apart. */}
        {appliedLabel === undefined ? (
          label
        ) : (
          <>
            <span aria-hidden="true">{label}</span>
            <AssistiveText>
              {label}, {appliedLabel}
            </AssistiveText>
          </>
        )}
        {appliedLabel !== undefined && condition !== undefined && (
          <ConditionMark className="mark" condition={condition} />
        )}
      </span>
      {/* biome-ignore lint/a11y/noRedundantRoles: some browsers drop a list's semantics once its bullets are removed; the explicit role keeps them */}
      <ul className="options" role="list">
        {options.map((option) => (
          <li key={option.value}>{renderWord(option)}</li>
        ))}
      </ul>
    </div>
  );
}
