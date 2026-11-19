import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { type ReactElement, useContext } from "react";
import { DropdownPanel } from "../../../../../../../common/DropdownButtonStandIn/index.js";
import Context from "./Context.js";
import type { PanelProps } from "./types.js";

/** A menu button's popover, holding its menu, named as the button is. */
export default function Panel({
  ref,
  id,
  triggerId,
}: PanelProps): ReactElement {
  const { items, onSelect, labelledBy } = assertInvariant(
    useContext(Context),
    "a menu button's panel renders inside the button",
  );
  return (
    <DropdownPanel ref={ref} id={id} aria-labelledby={labelledBy ?? triggerId}>
      <DropdownPanel.Menu items={items} onSelect={onSelect} />
    </DropdownPanel>
  );
}
