import type React from "react";
import type { ModeStripProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds mode-strip";

/**
 * The mode strip — the horizontal band atop a lens's viewport where the
 * lens's `context`, `controls` and `status` regions materialise. It is lens
 * furniture, not site chrome: a reading lens's strip is nearly empty, an
 * explorer's is dense.
 *
 * It renders the slot SOCKETS: three stable mounts (`context` · `controls`
 * · `status`, each carrying its `data-slot` identity) with sensible empties.
 * Each lens's layout passes the content it wants in each socket as these
 * props — this component stays a pure projection of its props.
 *
 * The band itself is the same on every lens: `--strip-h` tall, so the canvas
 * below never jumps on a lens switch.
 *
 * `import { ModeStrip } from "@canonical/prism-core";`
 */
const ModeStrip = ({
  className,
  context,
  controls,
  status,
  ...props
}: ModeStripProps): React.ReactElement => {
  return (
    <header
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-region="mode-strip"
      {...props}
    >
      <div className="strip-context" data-slot="context">
        {context}
      </div>
      <div className="strip-controls" data-slot="controls">
        {controls}
      </div>
      <div className="strip-status" data-slot="status">
        {status}
      </div>
    </header>
  );
};

export default ModeStrip;
