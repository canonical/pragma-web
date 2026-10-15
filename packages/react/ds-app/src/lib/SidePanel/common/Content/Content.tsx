import { useScrollOverflow } from "@canonical/react-hooks";
import type React from "react";
import { useEffect, useState } from "react";
import type { ContentProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-panel-content";

/**
 * Body of a SidePanel, and the only part of it that scrolls: however tall its
 * children are, the header and footer stay visible.
 *
 * While content is hidden past an edge, the pane marks that edge with a 2px
 * line — the top line once the pane scrolls away from the top, the bottom
 * line until it bottoms out, both together in between, neither when
 * everything fits. `useScrollOverflow` measures the pane and reports the two
 * edge states, and the pane publishes them as `data-overflow-top` and
 * `data-overflow-bottom` for the CSS to draw. That works wherever JavaScript
 * runs; where it does not, the pane falls back to scroll-driven CSS in the
 * engines that ship it (the markup carries no `data-overflow-driven` marker
 * until effects run, and the fallback keys on that absence), and paints
 * nothing in the rest.
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
  // The overflow measurement needs its own look at the pane element, and a
  // consumer ref must keep receiving it too: the hook fans the element out
  // to both.
  const {
    ref: paneRef,
    overflowTop,
    overflowBottom,
  } = useScrollOverflow<HTMLDivElement>(ref);

  /**
   * That confirms whether JS is enabled on the browser or not. State rather than an
   * imperative attribute write, so the server markup can never carry it:
   * the effect only runs on the client. That absence is exactly what the
   * no-JavaScript CSS fallback in styles.css keys on — a scripted pane is
   * driven by the hook, an unscripted one by scroll-driven animations in the
   * engines that ship them.
   */
  const [driven, setDriven] = useState(false);
  useEffect(() => {
    setDriven(true);
  }, []);

  return (
    <div
      ref={paneRef}
      className={[componentCssClassName, fill && "fill", className]
        .filter(Boolean)
        .join(" ")}
      // JS drives this pane's edge lines; the CSS fallback keys on the
      // attribute's absence (see `driven` above). Set before the spread, so
      // a consumer can still pin it.
      data-overflow-driven={driven || undefined}
      // The edge-line state, for the CSS in styles.css. Set before the
      // spread, so a consumer can still pin either attribute.
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
