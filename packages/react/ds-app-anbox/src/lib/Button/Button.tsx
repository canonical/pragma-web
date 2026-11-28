import type Props from "./types.js";
import "./styles.css";

const componentCssClassName = "ds button";

/** Buttons are clickable elements used to perform an action. */
const Button = ({
  className,
  children,
  appearance,
  ...props
}: Props): React.ReactElement => {
  return (
    <button
      className={[componentCssClassName, appearance, className]
        .filter(Boolean)
        .join(" ")}
      // Buttons derive their accessible name from their rendered text content.
      // String children are mirrored into aria-label; for any other children
      // the attribute is omitted so the name comes from the content itself.
      aria-label={
        props["aria-label"] ||
        (typeof children === "string" ? children : undefined)
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
