import {
  type ComponentType,
  createElement,
  type FC,
  Fragment,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  type RegisterOptions,
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form";
import type { BindFieldOptions, BindMode, FieldBindingProps } from "./types.js";

const subscribeHydration = () => () => {};
const getClientSnapshot = () => false;
const getServerSnapshot = () => true;

const hasSameSelection = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value) => right.includes(value));

const isOptionDisabled = (option: HTMLOptionElement) =>
  option.disabled ||
  (option.parentElement?.tagName === "OPTGROUP" &&
    (option.parentElement as HTMLOptGroupElement).disabled);

const hasSameOwnerValue = (left: unknown, right: unknown) =>
  Array.isArray(left) && Array.isArray(right)
    ? left.length === right.length &&
      left.every((item, index) => item === right.at(index))
    : Object.is(left, right);

/**
 * Adapts a presentational input (which knows nothing about react-hook-form)
 * into the field tier by performing the RHF binding. It consumes the
 * `name`/`registerProps` (and aria) props that `Wrapper` already injects, so it
 * does not re-run `useFieldWrapper`.
 *
 * - `native` — spreads `register(name, registerProps)` onto the input
 *   (uncontrolled; preserves RHF's native-input performance path).
 * - `controlled` — lifts `useController` out of the leaf and passes
 *   `value`/`onChange`/`onBlur`/`ref`.
 *
 * The binding mode is resolved once at factory time, so each returned component
 * calls its hooks unconditionally.
 *
 * @note Authored with `React.createElement` (no JSX) so this is a plain `.ts`
 * module; behaviour is identical to the JSX form.
 */
export default function bindField<P extends FieldBindingProps>(
  // biome-ignore lint/suspicious/noExplicitAny: presentational prop shapes vary per input
  Presentational: ComponentType<any>,
  mode: BindMode,
  options: BindFieldOptions = {},
): FC<P> {
  const label =
    (Presentational as { displayName?: string }).displayName ||
    Presentational.name ||
    "Input";

  // Merge the field's `additionalRegisterProps` UNDER the consumer's
  // registerProps (consumer always wins). `additionalRegisterProps` may be a
  // static object or a function of the component's own props; resolve it per
  // render against `props`. Cast once: RHF's RegisterOptions is a discriminated
  // union (e.g. `valueAsNumber` excludes `pattern`), which an object spread
  // cannot satisfy structurally even though the merged value is valid at runtime.
  const mergeRegister = (
    registerProps: RegisterOptions | undefined,
    props: Record<string, unknown>,
  ): RegisterOptions => {
    const extra =
      typeof options.additionalRegisterProps === "function"
        ? options.additionalRegisterProps(props)
        : options.additionalRegisterProps;
    return { ...extra, ...registerProps } as RegisterOptions;
  };

  const useNativeRegistration = (
    name: string,
    registerProps: RegisterOptions | undefined,
    props: Record<string, unknown>,
  ) => {
    const { register, control } = useFormContext();
    const rules = mergeRegister(registerProps, props);
    const getNativeRule = (rule: unknown) => {
      const value =
        rule && typeof rule === "object" && "value" in rule ? rule.value : rule;
      return value instanceof RegExp ? value.source : value;
    };
    // RHF merges registrations by name. Always replace the previous disabled
    // option, including when a form-wide or field-level disable is lifted.
    const disabled =
      !!control._options.disabled || !!rules.disabled || !!props.disabled;
    const registration = register(name, { ...rules, disabled });
    return {
      ...registration,
      ...(control._options.progressive
        ? {
            required: !!getNativeRule(rules.required),
            min: getNativeRule(rules.min) ?? props.min,
            max: getNativeRule(rules.max) ?? props.max,
            minLength: getNativeRule(rules.minLength) ?? props.minLength,
            maxLength: getNativeRule(rules.maxLength) ?? props.maxLength,
            pattern: getNativeRule(rules.pattern) ?? props.pattern,
          }
        : {}),
      disabled,
    };
  };

  let Bound: FC<P>;

  if (mode === "controlled") {
    const Controlled = ({ name, registerProps, ...rest }: P) => {
      const { control } = useFormContext();
      const rules = mergeRegister(registerProps, rest);
      const disabled =
        !!control._options.disabled ||
        !!rules.disabled ||
        !!(rest as Record<string, unknown>).disabled;
      const { field } = useController({
        name,
        rules,
        disabled,
        ...(options.defaultValue !== undefined
          ? { defaultValue: options.defaultValue }
          : {}),
      });
      return createElement(Presentational, {
        ...rest,
        disabled,
        name,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        ref: field.ref,
      });
    };
    Bound = (props: P) =>
      createElement(Controlled, { ...props, key: props.name });
  } else if (options.injectValue) {
    Bound = ({ name, registerProps, ...rest }: P) => {
      const registration = useNativeRegistration(name, registerProps, rest);
      const value = useWatch({ name });
      return createElement(Presentational, {
        ...rest,
        value,
        ...registration,
      });
    };
  } else if (options.injectDefaultValue) {
    Bound = ({ name, registerProps, ...rest }: P) => {
      const { getValues, setValue, control: formControl } = useFormContext();
      const hydrating = useSyncExternalStore(
        subscribeHydration,
        getClientSnapshot,
        getServerSnapshot,
      );
      const registration = useNativeRegistration(name, registerProps, rest);
      const initial = useRef({ name, value: getValues(name) });
      if (initial.current.name !== name)
        initial.current = { name, value: getValues(name) };
      const nativeProps = rest as Record<string, unknown>;
      const input = useRef<HTMLInputElement | null>(null);
      const watchedValue = useWatch({ name });
      const currentValue =
        watchedValue === undefined ? getValues(name) : watchedValue;
      const unresolvedId = useId();
      const selectedValues = Array.isArray(currentValue)
        ? currentValue.map(String)
        : currentValue == null || (nativeProps.multiple && currentValue === "")
          ? []
          : [String(currentValue)];
      const ownerIsDisabled =
        !!nativeProps.disabled ||
        registration.disabled ||
        !!formControl._options.disabled;
      const choices = Array.isArray(nativeProps.options)
        ? nativeProps.options
        : undefined;
      const unresolved =
        choices &&
        !ownerIsDisabled &&
        selectedValues.some(
          (value) =>
            !choices.some(
              (option) => option && option.value === value && !option.disabled,
            ),
        );
      useLayoutEffect(() => {
        if (
          input.current &&
          nativeProps.value === undefined &&
          options.formatDefaultValue
        ) {
          const value = getValues(name);
          if (value instanceof Date) {
            const formatted = options.formatDefaultValue(value);
            if (
              typeof formatted === "string" &&
              input.current.value !== formatted
            )
              input.current.value = formatted;
          }
        }
      });
      const ref = useCallback(
        (element: HTMLInputElement | HTMLSelectElement | null) => {
          input.current = element instanceof HTMLInputElement ? element : null;
          let draft: string | string[] | undefined;
          if (element && hydrating && nativeProps.value === undefined) {
            const ownerUnchanged = hasSameOwnerValue(
              getValues(name),
              initial.current.value,
            );
            if (element instanceof HTMLSelectElement) {
              const selected = Array.from(
                element.selectedOptions,
                (option) => option.value,
              );
              const defaults = Array.from(element.options)
                .filter((option) => option.defaultSelected)
                .map((option) => option.value);
              const fallback = Array.from(element.options).find(
                (option) => !isOptionDisabled(option),
              );
              const baseline = element.multiple
                ? defaults
                : defaults.length
                  ? [defaults.at(-1) ?? ""]
                  : fallback
                    ? [fallback.value]
                    : [];
              if (!hasSameSelection(selected, baseline) && ownerUnchanged)
                draft = element.multiple ? selected : (selected.at(0) ?? "");
            } else if (element.value !== element.defaultValue && ownerUnchanged)
              draft = element.value;
          }
          registration.ref(element);
          if (draft !== undefined) setValue(name, draft, { shouldDirty: true });
          else if (
            element instanceof HTMLInputElement &&
            nativeProps.value === undefined &&
            options.formatDefaultValue &&
            getValues(name) instanceof Date
          ) {
            const value = options.formatDefaultValue(getValues(name));
            if (typeof value === "string") element.value = value;
          }
        },
        [
          registration.ref,
          hydrating,
          name,
          getValues,
          setValue,
          nativeProps.value,
        ],
      );
      const field = createElement(Presentational, {
        ...(nativeProps.value === undefined &&
        nativeProps.defaultValue === undefined
          ? {
              defaultValue:
                nativeProps.multiple &&
                (initial.current.value == null || initial.current.value === "")
                  ? []
                  : options.formatDefaultValue
                    ? options.formatDefaultValue(initial.current.value)
                    : initial.current.value,
            }
          : {}),
        ...rest,
        ...(unresolved
          ? {
              "aria-invalid": true,
              "aria-describedby": [
                nativeProps["aria-describedby"],
                unresolvedId,
              ]
                .filter(Boolean)
                .join(" "),
            }
          : {}),
        ...registration,
        ref,
      });
      return createElement(
        Fragment,
        null,
        field,
        unresolved
          ? createElement(
              "span",
              { id: unresolvedId, role: "alert" },
              "Some selected options are unavailable.",
            )
          : null,
      );
    };
  } else {
    Bound = ({ name, registerProps, ...rest }: P) => {
      const registration = useNativeRegistration(name, registerProps, rest);
      return createElement(Presentational, {
        ...rest,
        ...registration,
      });
    };
  }

  Bound.displayName = `bindField(${label})`;
  return Bound;
}
