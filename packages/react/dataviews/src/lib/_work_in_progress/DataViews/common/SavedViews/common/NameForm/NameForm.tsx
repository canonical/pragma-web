import { Button } from "@canonical/react-ds-global";
import { TextInput } from "@canonical/react-ds-global-form";
import {
  type FormEvent,
  type ReactElement,
  type SyntheticEvent,
  useId,
  useRef,
  useState,
} from "react";
import type { NameFormProps } from "./types.js";

const componentCssClassName = "ds data-views-saved-views-name-form";

/**
 * The dialog asking for a new view's name, or a view's new name.
 *
 * The name is required, natively, and a name of only spaces does not match
 * its pattern: neither reaches the store. A name the collection refuses —
 * another view's — is set as the input's own validity, so the browser
 * reports it as it reports any constraint, and cleared as the name is edited
 * or submitted again. The input takes the focus as the dialog opens, and
 * takes it back when a name is refused. Cancel and Escape close the dialog,
 * which returns the name to `initial` and drops an answer still pending.
 *
 * @note Impure: sets and reports the input's validity, and moves the focus
 * to it when a name is refused.
 *
 * @implements ds:apps.subcomponent.data_views-saved_views-name_form
 */
export default function NameForm({
  label,
  submit,
  nameLabel,
  cancel,
  initial,
  pending,
  onSubmit,
  id,
  className,
  onClose,
  ...props
}: NameFormProps): ReactElement {
  // Null until edited: the input shows `initial`, as it stands.
  const [edited, setEdited] = useState<string | null>(null);
  const name = edited ?? initial;
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const dialogId = id ?? baseId;
  const labelId = `${baseId}-label`;
  const errorId = `${baseId}-error`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const dialog = event.currentTarget.closest("dialog");
    void onSubmit(name).then((refused) => {
      // An answer after Cancel or Escape is about a question no longer asked.
      if (!dialog?.open) {
        return;
      }
      setError(refused);
      input.current?.setCustomValidity(refused ?? "");
      if (refused !== null) {
        // Reporting takes the focus in every engine that shows a bubble;
        // the focus call is for the ones that do not.
        input.current?.reportValidity();
        input.current?.focus();
      }
    });
  };

  const handleClose = (event: SyntheticEvent<HTMLDialogElement>): void => {
    setEdited(null);
    setError(null);
    input.current?.setCustomValidity("");
    onClose?.(event);
  };

  return (
    <dialog
      {...props}
      id={dialogId}
      aria-label={label}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      onClose={handleClose}
    >
      <form aria-label={label} onSubmit={handleSubmit}>
        {/* The input's `id` lands on its wrapper, so no `for` can reach it. */}
        <span id={labelId} className="label">
          {nameLabel}
        </span>
        <TextInput
          ref={input}
          value={name}
          required
          pattern=".*\S.*"
          onChange={(event) => {
            setEdited(event.target.value);
            // A refusal is about the name as it was: editing it clears it.
            event.target.setCustomValidity("");
            setError(null);
          }}
          aria-labelledby={labelId}
          aria-describedby={error === null ? undefined : errorId}
        />
        {error === null ? null : (
          <p id={errorId} className="error">
            {error}
          </p>
        )}
        <Button
          type="submit"
          importance="primary"
          disabled={pending}
          onClick={() => {
            // The last refusal was about the last answer: ask again.
            input.current?.setCustomValidity("");
          }}
        >
          {submit}
        </Button>
        <Button type="button" commandfor={dialogId} command="close">
          {cancel}
        </Button>
      </form>
    </dialog>
  );
}
