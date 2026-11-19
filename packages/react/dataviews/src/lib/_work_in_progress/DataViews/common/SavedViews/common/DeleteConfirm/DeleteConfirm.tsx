import { Button } from "@canonical/react-ds-global";
import { type ReactElement, useId } from "react";
import type { DeleteConfirmProps } from "./types.js";

const componentCssClassName = "ds data-views-saved-views-confirm";

/**
 * The dialog deleting a view opens first, asking the question that names
 * the view. Cancel comes first, so the focus starts on it and a stray Enter
 * deletes nothing. Cancel and Escape close the dialog.
 *
 * @implements ds:apps.subcomponent.data_views-saved_views-delete_confirm
 */
export default function DeleteConfirm({
  question,
  submit,
  cancel,
  pending,
  onSubmit,
  id,
  className,
  ...props
}: DeleteConfirmProps): ReactElement {
  const baseId = useId();
  const dialogId = id ?? baseId;
  const messageId = `${baseId}-message`;
  return (
    <dialog
      {...props}
      id={dialogId}
      aria-labelledby={messageId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <p id={messageId} className="message">
        {question}
      </p>
      {/* The safe answer comes first, so the dialog's focus starts on it. */}
      <Button type="button" commandfor={dialogId} command="close">
        {cancel}
      </Button>
      <Button
        type="button"
        anticipation="destructive"
        disabled={pending}
        onClick={onSubmit}
      >
        {submit}
      </Button>
    </dialog>
  );
}
