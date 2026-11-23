import { useCallback, useRef } from "react";
import type { AnnouncerHandle } from "../../../../../common/index.js";
import type {
  UseSheetAnnouncerProps,
  UseSheetAnnouncerResult,
} from "./types.js";

/**
 * The bar's announcer, redirected to the sheet's own status region while
 * the sheet holds one: the page behind a modal dialog is inert, and the
 * root's region in it would go silent. With no region, as while the sheet
 * is closed, it speaks through the root's announcer.
 *
 * @param props - The root's announcer.
 * @returns The ref the sheet's region takes, and the redirected announcer.
 */
export default function useSheetAnnouncer({
  announce,
}: UseSheetAnnouncerProps): UseSheetAnnouncerResult {
  const regionRef = useRef<AnnouncerHandle>(null);
  const redirected = useCallback<UseSheetAnnouncerResult["announce"]>(
    (message, topic) => {
      const region = regionRef.current;
      if (region === null) announce(message, topic);
      else region.announce(message, topic);
    },
    [announce],
  );
  return { regionRef, announce: redirected };
}
