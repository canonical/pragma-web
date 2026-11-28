import type { ButtonProps } from "../Button/index.js";
import type { WithContextualMenuProps } from "../ContextualMenu/index.js";

/** Button's props, plus the menu's. */
export type DropdownButtonProps = WithContextualMenuProps<ButtonProps>;
