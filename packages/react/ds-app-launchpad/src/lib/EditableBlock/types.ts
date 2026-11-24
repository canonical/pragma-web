/* @canonical/generator-ds 0.8.0-experimental.0 */
import type React from "react";
import type { ComponentProps, JSX } from "react";

export interface EditingContextType {
  isEditing: boolean;
  toggleEditing: () => void;
}

export type EditElementProps = EditingContextType;

export type EditElement<T extends EditElementProps> = (
  props: T,
) => React.ReactNode;

type OwnProps<T extends EditElementProps> = {
  /** Component to render when in edit mode, must implement EditElement interface */
  EditComponent: EditElement<T>;
  /** Title text for the editable block */
  title?: string;
  /** HTML element type to render as the title component (e.g., 'div', 'section') */
  tag?: keyof JSX.IntrinsicElements;

  /** Whether the block is read-only */
  isReadOnly?: boolean;
};

export type EditableBlockProps<T extends EditElementProps> = OwnProps<T> &
  Omit<ComponentProps<"div">, keyof OwnProps<T>>;

export type { EditableBlockProps as default };
