import type { StoryWords } from "./types.js";

/**
 * Pick the words a story's args carry, as props a root spreads: nothing
 * when no `messages` arg is set, so the root speaks English as before.
 */
export default function pickStoryWords({
  messages,
}: {
  readonly messages?: StoryWords["messages"] | undefined;
}): StoryWords {
  return messages === undefined ? {} : { messages };
}
