import type { ComponentProps } from "react";

type OwnProps = {
  /** The dialog's and the form's accessible name: what the name is for. */
  readonly label: string;
  /** The submit button's text. */
  readonly submit: string;
  /** The name input's label. */
  readonly nameLabel: string;
  /** The cancel button's text. */
  readonly cancel: string;
  /** The name the input starts with, and returns to as the dialog closes. */
  readonly initial: string;
  /** Whether a command is in flight; the form cannot submit meanwhile. */
  readonly pending: boolean;
  /**
   * Submit a name. Resolves with why it was refused, as a sentence, or null
   * once it is taken.
   */
  readonly onSubmit: (name: string) => Promise<string | null>;
};

/**
 * Props of the name dialog. The root is a `dialog`, so it extends native
 * dialog props; `children` is excluded, since the dialog renders its own
 * form, and so is `aria-label`, which `label` gives.
 */
export type NameFormProps = OwnProps &
  Omit<ComponentProps<"dialog">, keyof OwnProps | "children" | "aria-label">;
