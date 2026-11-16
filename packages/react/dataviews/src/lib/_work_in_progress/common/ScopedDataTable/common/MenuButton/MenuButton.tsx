import { type ReactElement, useMemo } from "react";
import { withDropdownPanel } from "../../../../../common/DropdownButtonStandIn/index.js";
import { IconButtonStandIn } from "../../../../../common/IconButtonStandIn/index.js";
import { Panel, PanelContext } from "./common/Panel/index.js";
import type { MenuButtonProps } from "./types.js";

/** The icon button and the popover it opens, wired once for every menu. */
const Trigger = withDropdownPanel(
  IconButtonStandIn,
  ({ ref, id, triggerId }) => <Panel ref={ref} id={id} triggerId={triggerId} />,
);

/**
 * A tertiary icon button that opens a menu in a popover, named as the
 * button is.
 */
export default function MenuButton({
  menuProps,
  ...props
}: MenuButtonProps): ReactElement {
  const labelledBy = props["aria-labelledby"];
  const value = useMemo(
    () => ({ ...menuProps, labelledBy }),
    [menuProps, labelledBy],
  );
  return (
    <PanelContext value={value}>
      <Trigger importance="tertiary" {...props} />
    </PanelContext>
  );
}
