import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { ItemProps } from "./common/Item/types.js";

type OwnProps = {
  /**
   * Accordion.Item elements to render. Typed as `ReactNode` so conditional
   * items (`{cond && <Accordion.Item />}`) and fragments are accepted; the
   * Accordion renders them as given.
   */
  children: ReactNode;
};

/**
 * Props for the Accordion component
 */
export type AccordionProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;

/**
 * Accordion component type with attached subcomponents
 */
export type AccordionComponent = ((props: AccordionProps) => ReactElement) & {
  Item: (props: ItemProps) => ReactElement;
};
