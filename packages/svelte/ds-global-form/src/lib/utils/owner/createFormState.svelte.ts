import { tick } from "svelte";
import type {
  FormErrors,
  FormState,
  FormStateOptions,
  FormValues,
} from "./types.js";

/**
 * Builds a minimal form owner on `$state`: values, errors and touched fields,
 * validated by one `validate` function at the time `mode` says, as
 * react-hook-form's `useForm`. Pass it to a `Form`:
 *
 * ```svelte
 * <Form owner={createFormState({ defaultValues, validate, onSubmit })}>
 * ```
 *
 * On submit, every field is validated. An invalid form does not post and its
 * first invalid control is focused. A valid form calls `onSubmit` instead of
 * posting, or posts natively when `onSubmit` is unset. After the first submit,
 * a field is validated again on its every change.
 * @note Pure: the returned owner holds its own state.
 */
export default function createFormState<Values extends FormValues>({
  defaultValues = {} as Values,
  validate,
  mode = "onSubmit",
  onSubmit,
}: FormStateOptions<Values> = {}): FormState<Values> {
  type Name = keyof Values & string;
  const values = $state<Values>({ ...defaultValues });
  const errors = $state<FormErrors<Values>>({});
  const touched = $state<Partial<Record<Name, true>>>({});
  let isSubmitted = $state(false);
  let isSubmitting = $state(false);

  /**
   * Validates the form and updates the messages of `names`, or of every field.
   * Returns whether the whole form is valid.
   */
  function runValidation(names?: readonly Name[]): boolean {
    const found = Object.entries(
      validate?.($state.snapshot(values) as Values) ?? {},
    ).filter((entry): entry is [Name, string] => entry[1] !== undefined);
    for (const name of names ?? (Object.keys(errors) as Name[]))
      delete errors[name];
    for (const [name, message] of found)
      if (!names || names.includes(name)) errors[name] = message;
    return found.length === 0;
  }

  /** Empties a `$state` record in place, so its readers stay subscribed. */
  function clear(record: Record<string, unknown>): void {
    for (const key of Object.keys(record)) delete record[key];
  }

  return {
    get values() {
      return values;
    },
    get errors() {
      return errors;
    },
    get touched() {
      return touched;
    },
    get isSubmitted() {
      return isSubmitted;
    },
    get isSubmitting() {
      return isSubmitting;
    },
    setValue(name, value) {
      if (value === undefined) delete values[name];
      else values[name] = value;
      if (
        isSubmitted ||
        mode === "onChange" ||
        (mode === "onTouched" && touched[name])
      )
        runValidation([name]);
    },
    getError: (name) => errors[name],
    blur(name) {
      touched[name] = true;
      if (mode === "onBlur" || mode === "onTouched") runValidation([name]);
    },
    reset() {
      clear(values);
      Object.assign(values, defaultValues);
      clear(errors);
      clear(touched);
      isSubmitted = false;
    },
    submit(event) {
      isSubmitted = true;
      if (!runValidation()) {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        // The error state renders on the next update; focus it then.
        void tick().then(() =>
          form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        );
        return;
      }
      if (!onSubmit) return;
      event.preventDefault();
      const done = onSubmit($state.snapshot(values) as Values);
      if (!(done instanceof Promise)) return;
      isSubmitting = true;
      void done.finally(() => {
        isSubmitting = false;
      });
    },
  };
}
