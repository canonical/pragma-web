import type { ElementType, ReactElement, ReactNode } from "react";

/**
 * Places the story before a focusable `<main>`, for stories that come first
 * in reading order, such as a skip link.
 *
 * @param id - the main element's id.
 * @param children - the main element's content.
 */
export default function beforeMain({
  id = "main",
  children,
}: {
  id?: string;
  children?: ReactNode;
}) {
  return (Story: ElementType): ReactElement => (
    <>
      <Story />
      <main id={id} tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
