import { Button } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import type { MessageLineProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-message-line";

/**
 * The query bar's errors and warnings, visible while the field has focus:
 * an Error's look without its `role="alert"`, since the bar's announcer
 * says each one once, politely. Each message may carry the one action
 * that resolves it; a press on it takes no focus, so the field keeps its
 * layout and the action stays under the pointer.
 */
export default function MessageLine({
  entries,
  className,
  ...rest
}: MessageLineProps): ReactElement | null {
  if (entries.length === 0) return null;
  return (
    <div
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {entries.map(({ id, text, criticality, action }) => (
        <p key={id} className="message" data-criticality={criticality}>
          <span className="text">{text}</span>
          {action === undefined ? null : "href" in action ? (
            <a className="action" href={action.href}>
              {action.label}
            </a>
          ) : (
            <Button
              type="button"
              importance="tertiary"
              className="action"
              // A press takes no focus, so the field keeps its layout,
              // wrapped or not, and the action stays under the pointer.
              onMouseDown={(event) => event.preventDefault()}
              onClick={action.onAction}
            >
              {action.label}
            </Button>
          )}
        </p>
      ))}
    </div>
  );
}
