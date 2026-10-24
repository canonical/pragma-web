import { Cards } from "@canonical/react-ds-global";
import type { ElementType, ReactElement } from "react";

/**
 * Storybook decorator that puts a card in the published `Cards` group, each
 * card at two columns of the intrinsic grid the story's `grid` parameter
 * supplies, as an index lays its cards out.
 *
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withCards(), withRelayEnvironment],
 * parameters: { grid: "intrinsic" },
 * ```
 */
const withCards =
  () =>
  (Story: ElementType): ReactElement => (
    <Cards cardSpan={2}>
      <Story />
    </Cards>
  );

export default withCards;
