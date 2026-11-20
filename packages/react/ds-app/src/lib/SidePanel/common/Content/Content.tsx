import { useScrollOverflow } from "@canonical/react-hooks";
import type React from "react";
import { useEffect, useState } from "react";
import type { ContentProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-panel-content";

/**
 * Whether the engine paints the pane's edge lines with scroll-driven
 * animations — the CSS-first mechanism in styles.css. Client-only: the
 * server and engines without the feature report false, so the pane measures
 * with JavaScript until the probe says the CSS owns the lines.
 */
const useScrollTimelineSupport = (): boolean => {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(
      typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("animation-timeline", "scroll()"),
    );
  }, []);
  return supported;
};

/**
 * Body of a SidePanel, and the only part of it that scrolls: however tall its
 * children are, the header and footer stay visible.
 *
 * While content is hidden past an edge, the pane marks that edge with a 2px
 * line — the top line once the pane scrolls away from the top, the bottom
 * line until it bottoms out, both together in between, neither when
 * everything fits. The lines are CSS-first: engines with scroll-driven
 * animations paint them by animating the pane's borders against its own
 * scroll progress, with or without JavaScript. Engines without fall back to
 * measurement: `useScrollOverflow` reports the two edge states, and the pane
 * publishes them as `data-overflow-top` and `data-overflow-bottom` for the
 * CSS to draw. Engines with neither paint nothing: without a measurement
 * there is no truthful answer about which edges overflow.
 *
 * The pane is its own scroll container, so it is a tab stop: a keyboard
 * user tabs to it and scrolls it with the arrow and page keys, even when it
 * holds nothing focusable.
 *
 * @implements ds:apps.subcomponent.side_panel-content
 */
const Content = ({
  children,
  className,
  fill = false,
  ref,
  ...props
}: ContentProps): React.ReactElement => {
  // The edge lines are CSS-first: where scroll-driven animations run,
  // styles.css paints them and the measurement must stand down; everywhere
  // else the hook drives. The probe starts pessimistic, so the very first
  // frame is measured either way and the lines are never a frame late.
  const cssDriven = useScrollTimelineSupport();

  // The overflow measurement needs its own look at the pane element, and a
  // consumer ref must keep receiving it too: the hook fans the element out
  // to both. Stood down, it clears the flags it measured on mount, so the
  // edge attributes below exist only while JavaScript drives the lines.
  const {
    ref: paneRef,
    overflowTop,
    overflowBottom,
  } = useScrollOverflow<HTMLDivElement>(ref, { enabled: !cssDriven });

  return (
    <div
      ref={paneRef}
      className={[componentCssClassName, fill && "fill", className]
        .filter(Boolean)
        .join(" ")}
      // The edge-line state, for the CSS in styles.css — present only while
      // the hook drives: in engines with scroll-driven animations it stands
      // down and clears them, leaving the CSS as the sole owner. Set before
      // the spread, so a consumer can still pin either attribute.
      data-overflow-top={overflowTop || undefined}
      data-overflow-bottom={overflowBottom || undefined}
      // A scroll container a keyboard user cannot focus cannot be scrolled,
      // so the pane is a tab stop. Set before the spread, so the native prop
      // can still take it out of the tab order.
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focus is what makes the scroll region keyboard-operable.
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

Content.displayName = "SidePanel.Content";

export default Content;
