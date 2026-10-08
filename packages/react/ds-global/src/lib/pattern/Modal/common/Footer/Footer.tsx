import type React from "react";
import type { FooterProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds modal-footer";

/**
 * Modal.Footer subcomponent
 *
 * Holds the modal's actions. When the modal is a confirmation or a form, these
 * capture the decision; the button's modifiers must match the consequence, so a
 * destructive confirmation uses a destructive button.
 *
 * @implements ds:global.subcomponent.modal-footer
 */
const Footer = ({
  children,
  className,
  ...props
}: FooterProps): React.ReactElement => (
  // A <div>, not a <footer>: a <footer> only loses its page-level contentinfo
  // landmark inside article, aside, main, nav or section — a <dialog> is not
  // one of those, so browsers would expose this action bar as a second site
  // footer. No landmark is needed inside the dialog.
  <div
    className={[componentCssClassName, className].filter(Boolean).join(" ")}
    {...props}
  >
    {children}
  </div>
);

Footer.displayName = "Modal.Footer";

export default Footer;
