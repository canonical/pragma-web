import { within } from "storybook/test";

/** The table's record rows: every row but the header's. */
export default function countRows(canvasElement: HTMLElement): number {
  return within(canvasElement).getAllByRole("row").length - 1;
}
