/**
 * The announcer's contract: the handle a root speaks through, and the props
 * of the region that holds what it says. Together because a root holds the
 * one and renders the other.
 */

import type { ComponentProps, ReactNode, Ref } from "react";
import type { ORDERING_TOPIC, SORT_REFUSAL_TOPIC } from "./constants.js";

/**
 * A topic an announcement can stand under: an outcome with one latest
 * answer. Every topic a part speaks under is named here, so a misspelling is
 * a type error rather than an announcement nothing ever replaces.
 */
export type AnnouncerTopic = typeof ORDERING_TOPIC | typeof SORT_REFUSAL_TOPIC;

/** What a root holds of its announcer: the way to say something. */
export type AnnouncerHandle = {
  /**
   * Say an outcome that has no place on screen to be read from. Messages said
   * in the same moment are spoken as one announcement, and the same words
   * said twice in that moment are said once; the same words said again after
   * it are spoken again. Words are the same when they are the same string: a
   * message carrying elements is spoken as often as it is said, since two
   * such messages cannot be compared by what they read as.
   *
   * A message said under a `topic` replaces whatever was waiting under that
   * topic: an outcome with one latest answer — what the rows are ordered by —
   * is read as it stands, not as it passed through.
   */
  readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
};

type OwnProps = {
  /** Receives the handle the root announces through, in place of the node. */
  readonly ref: Ref<AnnouncerHandle>;
};

/**
 * Props of the announcer. Its root is the live region's `div`, so it extends
 * native div props, less those the region owns: `children`, what it says,
 * and `aria-live` and `aria-relevant`, how it is read.
 */
export type AnnouncerProps = OwnProps &
  Omit<
    ComponentProps<"div">,
    keyof OwnProps | "children" | "aria-live" | "aria-relevant"
  >;
