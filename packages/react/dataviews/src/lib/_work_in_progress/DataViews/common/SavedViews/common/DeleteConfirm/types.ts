import type { ComponentProps } from "react";

type OwnProps = {
  /** The question deleting asks first, naming the view. */
  readonly question: string;
  /** The submitting button's text. */
  readonly submit: string;
  /** The cancel button's text. */
  readonly cancel: string;
  /** Whether a command is in flight; deleting waits for it. */
  readonly pending: boolean;
  /** Delete the view the question names. */
  readonly onSubmit: () => void;
};

/**
 * Props of the delete dialog. The root is a `dialog`, so it extends native
 * dialog props; `children` is excluded, since the dialog renders its own
 * answers, and so is `aria-labelledby`, which the question gives.
 */
export type DeleteConfirmProps = OwnProps &
  Omit<
    ComponentProps<"dialog">,
    keyof OwnProps | "children" | "aria-labelledby"
  >;
