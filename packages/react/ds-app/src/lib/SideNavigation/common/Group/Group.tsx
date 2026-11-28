import type React from "react";
import { GroupHeader } from "../GroupHeader/index.js";
import type { GroupProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation-group";

/**
 * SideNavigation.Group — a named collection of navigation entries, with an
 * optional SideNavigation.GroupHeader. One of NavTree's direct content
 * entries. Starts with a divider when `divider` is set (every group but
 * the first).
 *
 * @implements ds:apps.subcomponent.side_navigation-item_group
 */
const Group = ({
  label,
  // The divider is hidden for now (operator, 2026-11-28); restore the render below.
  divider: _divider = false,
  children,
  className,
  ...props
}: GroupProps): React.ReactElement => (
  <section
    className={[componentCssClassName, className].filter(Boolean).join(" ")}
    {...props}
  >
    {/* {divider && <hr className="divider" />} */}
    {label != null && <GroupHeader>{label}</GroupHeader>}
    <ul className="list">{children}</ul>
  </section>
);

export default Group;
