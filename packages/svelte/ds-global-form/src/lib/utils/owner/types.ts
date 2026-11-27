/** A form's values, by field name. */
export type FormValues = Record<string, unknown>;

/**
 * The state a `Form` reads and writes by field name: values, and optionally
 * errors, blur and submission. Every read must be reactive under runes, as
 * reads of a `$state` object are; adapt a store that is not with
 * `createBinding`.
 */
export type FormOwner<Values extends FormValues = FormValues> = {
  /** The current values, by field name. */
  readonly values: Values;
  /** Writes one field's value. Writing `undefined` drops it. */
  setValue<Name extends keyof Values & string>(
    name: Name,
    value: Values[Name] | undefined,
  ): void;
  /**
   * Returns the field's validation message, if any. A field shows every
   * message it is given: when errors exist is the owner's business.
   */
  getError?(name: keyof Values & string): string | undefined;
  /** Called when the user leaves the field. */
  blur?(name: keyof Values & string): void;
  /**
   * Called when the form is submitted, after native validation passed. Call
   * `event.preventDefault()` to stop the browser posting the form.
   */
  submit?(event: SubmitEvent): void;
};

/** The owner state of one field, to spread onto a `Field` or field component. */
export type FieldBinding = {
  readonly error: string | undefined;
  onblur: () => void;
};

/**
 * A store that is not reactive under runes, such as a form library's own
 * store: the owner methods plus a way to read every value and to subscribe to
 * changes.
 */
export type BindingSource<Values extends FormValues = FormValues> = Omit<
  FormOwner<Values>,
  "values"
> & {
  /** Returns the current values. */
  getValues(): Values;
  /** Calls `notify` after every change, and returns a function that stops it. */
  subscribe(notify: () => void): () => void;
};

/** A form's validation messages, by field name. */
export type FormErrors<Values extends FormValues = FormValues> = Partial<
  Record<keyof Values & string, string>
>;

/**
 * When `createFormState` validates, as react-hook-form's `mode`. Every mode
 * also validates on submit, and after the first submit on every change.
 * - `onSubmit`: on submit only.
 * - `onChange`: on every change.
 * - `onBlur`: when the user leaves a field.
 * - `onTouched`: when the user first leaves a field, then on its every change.
 */
export type ValidationMode = "onSubmit" | "onChange" | "onBlur" | "onTouched";

/** Options of `createFormState`. */
export type FormStateOptions<Values extends FormValues = FormValues> = {
  /** The initial values, restored by `reset`. */
  defaultValues?: Values;
  /** Returns the messages of the invalid fields. Leave a valid field out. */
  validate?: (values: Readonly<Values>) => FormErrors<Values>;
  /** When to validate. Default: "onSubmit". */
  mode?: ValidationMode;
  /**
   * Called with the values on a valid submit, instead of posting the form.
   * Leave it unset to let a valid form post natively, for example to a
   * SvelteKit action.
   */
  onSubmit?: (values: Values) => void | Promise<void>;
};

/** The owner `createFormState` returns. */
export type FormState<Values extends FormValues = FormValues> =
  ResettableOwner<Values> & {
    /** The current messages, by field name. */
    readonly errors: Readonly<FormErrors<Values>>;
    /** The fields the user has left, by field name. */
    readonly touched: Readonly<Partial<Record<keyof Values & string, true>>>;
    /** Has the form been submitted since it was created or reset. */
    readonly isSubmitted: boolean;
    /** Is an asynchronous `onSubmit` running. */
    readonly isSubmitting: boolean;
    getError(name: keyof Values & string): string | undefined;
    blur(name: keyof Values & string): void;
    submit(event: SubmitEvent): void;
  };

/** A field's asynchronous check: resolves to its message, or `undefined` when valid. */
export type FieldValidator<Value> = (
  value: Value,
  signal: AbortSignal,
) => Promise<string | undefined>;

/** An owner that can return to its initial values. */
export type ResettableOwner<Values extends FormValues = FormValues> =
  FormOwner<Values> & {
    /** Returns every value to its initial state. */
    reset(): void;
  };

/** An owner whose fields are also checked asynchronously. */
export type ValidatedOwner<Values extends FormValues = FormValues> =
  ResettableOwner<Values> & {
    /**
     * Checks every validated field against its current value and resolves to
     * whether the form is free of errors.
     */
    validate(): Promise<boolean>;
  };

/** How a piece of latest-only work ended. */
export type LatestOutcome<Output> =
  | { status: "done"; value: Output }
  | { status: "failed"; error: unknown }
  | { status: "superseded" };
