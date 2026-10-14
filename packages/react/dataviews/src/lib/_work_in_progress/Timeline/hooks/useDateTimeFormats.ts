import { readInstant } from "@canonical/dataviews-core/bindings";
import { useCallback, useMemo, useState } from "react";
import type { TimelineDateTimeFormats } from "../types.js";
import formatAbsolute from "../utils/formatAbsolute.js";
import formatRelative from "../utils/formatRelative.js";
import type { FormattedDateTime, UseDateTimeFormatsResult } from "./types.js";

/**
 * The form every event's date is shown in, and how one date is written in
 * it: absolute by default, relative once toggled, each with the other as its
 * alternate. A form that writes nothing falls back to the absolute one.
 */
export default function useDateTimeFormats(
  formats: TimelineDateTimeFormats | undefined,
): UseDateTimeFormatsResult {
  const {
    locale = "en",
    timeZone,
    formatAbsolute: writeAbsolute,
    formatRelative: writeRelative,
    toggleable = true,
    tooltip = true,
  } = formats ?? {};
  const [mode, setMode] = useState<"absolute" | "relative">("absolute");
  const toggle = useCallback(() => {
    if (toggleable) {
      setMode((current) => (current === "absolute" ? "relative" : "absolute"));
    }
  }, [toggleable]);
  const format = useCallback(
    (value: string): FormattedDateTime => {
      const absolute =
        writeAbsolute === undefined
          ? formatAbsolute(value, locale, timeZone)
          : writeAbsolute(value, locale);
      const now = Date.now();
      let relative: string;
      if (writeRelative === undefined) {
        const at = readInstant(value);
        relative = at === null ? "" : formatRelative(at, now, locale);
      } else {
        relative = writeRelative(value, now, locale);
      }
      return mode === "relative" && relative !== ""
        ? { display: relative, alternate: absolute }
        : {
            display: absolute,
            alternate: relative === "" ? absolute : relative,
          };
    },
    [mode, locale, timeZone, writeAbsolute, writeRelative],
  );
  return useMemo(
    () => ({ mode, toggle, toggleable, tooltip, format }),
    [mode, toggle, toggleable, tooltip, format],
  );
}
