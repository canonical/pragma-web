import type { ReactElement } from "react";
import { useHydrationFocusHandoff } from "../../../../../../hooks/index.js";
import type { ControlProps } from "./types.js";

/**
 * One header control: a link to the query it leads to before scripts take
 * over, a button after, and a reader focused on the link keeps focus on the
 * button replacing it.
 */
export default function Control({
  href,
  hydrated,
  label,
  describedBy,
  onActivate,
  children,
}: ControlProps): ReactElement | null {
  const { link, button } = useHydrationFocusHandoff({ hydrated });
  if (hydrated) {
    return (
      <button
        ref={button}
        type="button"
        className="control"
        aria-label={label}
        aria-describedby={describedBy}
        onClick={onActivate}
      >
        {children}
      </button>
    );
  }
  return href === null ? null : (
    <a
      ref={link}
      className="control"
      href={href}
      aria-label={label}
      aria-describedby={describedBy}
    >
      {children}
    </a>
  );
}
