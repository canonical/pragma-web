import type { ComponentProps } from "react";

/** FiltersDisclosure's own props. */
type OwnProps = {
  /** How many filter chips the bar shows, a range counting once, which its summary counts. */
  readonly applied: number;
};

/**
 * Props of the bar's disclosure of the filters form. The rest reach its
 * `details`, apart from `children`, which it renders itself.
 */
export type FiltersDisclosureProps = OwnProps &
  Omit<ComponentProps<"details">, keyof OwnProps | "children">;
