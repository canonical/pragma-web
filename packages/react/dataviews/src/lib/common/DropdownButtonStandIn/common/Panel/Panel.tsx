import type React from "react";
import { usePanelElement } from "./hooks/index.js";
import type { PanelProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds dropdown-button-panel";

/**
 * The native `popover="auto"` a DropdownButton's menu sits in, named by its
 * trigger's `popovertarget`, so it opens and closes with no script.
 * Closing it with focus inside returns focus to the trigger.
 */
export default function Panel({
  panel,
  children,
}: PanelProps): React.ReactElement {
  const { attachElement, handleBeforeToggle, handleToggle } =
    usePanelElement(panel);

  // tabIndex -1: a click on the popover outside an item keeps focus inside
  // it, so closing then returns focus to the trigger.
  return (
    <div
      ref={attachElement}
      id={panel.panelId}
      popover="auto"
      tabIndex={-1}
      className={`${componentCssClassName} surface`}
      style={{ positionAnchor: panel.anchorName }}
      onBeforeToggle={handleBeforeToggle}
      onToggle={handleToggle}
    >
      {children}
    </div>
  );
}
