import { createElement, useEffect, useReducer, useRef } from "react";
import { type FieldError, useFormContext } from "react-hook-form";
import type { Middleware } from "../../common/types.js";

interface ValidationOptions {
  method?: string;
  headers?: Record<string, string>;
  // biome-ignore lint/suspicious/noExplicitAny: TODO
  bodyFormatter?: (value: any) => any;
  errorExtractor?: (response: Response) => Promise<string> | string;
  minLength?: number;
  debounceWait?: number;
}

const getPathSegments = (path: string) =>
  path.split(/[.[\]'"]/).filter(Boolean);

const isSameOrAncestor = (ancestor: string, field: string) => {
  const prefix = getPathSegments(ancestor);
  const target = getPathSegments(field);
  return (
    prefix.length <= target.length &&
    prefix.every((segment, index) => segment === target.at(index))
  );
};

/**
 * Adds a debounced advisory remote check to a field. Pending or failed requests
 * do not prevent submission, and RHF validation may clear the resulting error.
 * @note Performs network requests and updates the form's error state.
 */
function addRESTFieldValidation(
  url: string,
  options: ValidationOptions = {},
  // biome-ignore lint/suspicious/noExplicitAny: TODO
): Middleware<any> {
  const {
    method = "POST",
    headers = { "Content-Type": "application/json" },
    bodyFormatter = (value) => ({ value }),
    errorExtractor = async () => "Validation failed",
    minLength = 3,
    debounceWait = 300,
  } = options;

  return (WrappedComponent) => {
    return function ExtendedComponent(props) {
      const { name } = props;
      const { setError, clearErrors, getFieldState, getValues, watch } =
        useFormContext();
      const value = watch(name);
      const ownedError = useRef<FieldError | undefined>(undefined);
      const generation = useRef(0);
      const cancel = useRef<() => void>(() => {});
      const [revision, advanceRevision] = useReducer(
        (current: number) => current + 1,
        0,
      );

      useEffect(() => {
        const subscription = watch((_values, info) => {
          if (!info.name || isSameOrAncestor(info.name, name)) {
            generation.current += 1;
            cancel.current();
            advanceRevision();
          }
        });
        return () => subscription.unsubscribe();
      }, [name, watch]);

      // revision tracks intermediate changes even if the final value is unchanged.
      // biome-ignore lint/correctness/useExhaustiveDependencies: revision invalidates batched changes
      useEffect(() => {
        const current = ++generation.current;
        const controller = new AbortController();
        const clearOwnedError = () => {
          if (
            ownedError.current &&
            getFieldState(name).error === ownedError.current
          )
            clearErrors(name);
          ownedError.current = undefined;
        };
        clearOwnedError();
        const isCurrent = () =>
          generation.current === current &&
          !controller.signal.aborted &&
          getValues(name) === value;
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (value && value.length >= minLength) {
          timer = setTimeout(() => {
            void (async () => {
              try {
                const response = await fetch(url, {
                  method,
                  headers,
                  body: JSON.stringify(bodyFormatter(value)),
                  signal: controller.signal,
                });
                const message = response.ok
                  ? undefined
                  : await errorExtractor(response);
                if (!isCurrent()) return;
                if (response.ok) clearOwnedError();
                else {
                  const existing = getFieldState(name).error;
                  if (!existing || existing === ownedError.current) {
                    setError(name, { type: "manual", message });
                    ownedError.current = getFieldState(name).error;
                  }
                }
              } catch {
                // A failed request cannot validate the value or own an error.
              }
            })();
          }, debounceWait);
        }
        cancel.current = () => {
          clearTimeout(timer);
          controller.abort();
        };
        return () => {
          generation.current += 1;
          cancel.current();
          clearOwnedError();
        };
      }, [
        value,
        revision,
        name,
        clearErrors,
        getFieldState,
        getValues,
        setError,
      ]);

      return createElement(WrappedComponent, props);
    };
  };
}

export default addRESTFieldValidation;
