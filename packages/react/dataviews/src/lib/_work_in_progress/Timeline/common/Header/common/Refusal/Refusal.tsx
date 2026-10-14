import type { ReactElement } from "react";
import type { RefusalProps } from "./types.js";

/** Why a header control's last change was refused, describing that control. */
export default function Refusal({
  id,
  refusal,
}: RefusalProps): ReactElement | null {
  return refusal === null ? null : (
    <span id={id} className="refusal">
      {refusal}
    </span>
  );
}
