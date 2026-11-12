import { Chip } from "@canonical/react-ds-global";
import type React from "react";
import { MAX_VISIBLE_TAGS } from "./constants.js";
import type { SuggestionsProps } from "./types.js";
import { getOptionId } from "./utils.js";
import "./styles.css";

const componentCssClassName = "ds prompt-input-suggestions";

/**
 * The grouped list of suggestions under a `PromptInput`. Focus stays in the
 * prompt's textarea, which moves the highlight with `aria-activedescendant`,
 * so the rows themselves never take focus.
 */
const Suggestions = ({
  id,
  className,
  groups,
  activeOptionId,
  onSelect,
  ...props
}: SuggestionsProps): React.ReactElement => {
  return (
    <div
      id={id}
      role="listbox"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      // Otherwise the textarea blurs and closes the list before the click lands.
      onMouseDown={(event) => event.preventDefault()}
      {...props}
    >
      {groups.map((group, groupIndex) => {
        if (group.items.length === 0) return null;
        const labelId = `${id}-${groupIndex}-label`;

        return (
          // biome-ignore lint/a11y/useSemanticElements: a listbox may own only groups and options, and a fieldset groups form controls, not options
          <div
            key={group.id}
            role="group"
            aria-labelledby={labelId}
            className="group"
          >
            <div id={labelId} className="label">
              {group.label}
            </div>
            <div className="options">
              {group.items.map((item, itemIndex) => {
                const optionId = getOptionId(id, groupIndex, itemIndex);
                const tags = item.tags ?? [];
                const hiddenTagCount = tags.length - MAX_VISIBLE_TAGS;

                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: the textarea owns the keyboard and selects the highlighted row on Enter.
                  <div
                    key={item.id}
                    id={optionId}
                    role="option"
                    aria-selected={optionId === activeOptionId}
                    tabIndex={-1}
                    className="option"
                    onClick={() => onSelect(item, group)}
                  >
                    {item.icon ? (
                      <span className="icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="text">{item.label}</span>
                    {tags.length > 0 ? (
                      <span className="tags">
                        {tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                          <Chip key={tag} value={tag} />
                        ))}
                        {hiddenTagCount > 0 ? (
                          <span className="more">+{hiddenTagCount}</span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Suggestions;
