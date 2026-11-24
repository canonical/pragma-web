import { type ComponentType, createElement, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { BaseInputProps } from "../../common/types.js";

interface ValidationOptions {
  /** HTTP method of the validation request. Defaults to `"POST"`. */
  method?: string;
  /** Headers sent with the validation request. Default to a JSON content type. */
  headers?: Record<string, string>;
  /** Builds the JSON request body from the value. Defaults to `{ value }`. */
  bodyFormatter?: (value: string) => unknown;
  /** Reads the error message from a failed response. */
  errorExtractor?: (response: Response) => Promise<string> | string;
  /** Shortest value that is sent for validation. Defaults to 3. */
  minLength?: number;
  /** Milliseconds to wait after the last change before sending. Defaults to 300. */
  debounceWait?: number;
}

/** A middleware that works with any field. */
type ValidationMiddleware = <Props extends BaseInputProps>(
  Component: ComponentType<Props>,
) => ComponentType<Props>;

/**
 * Validates a field's value against a REST endpoint once the user stops
 * typing, and sets the field's error when the endpoint rejects it.
 *
 * Each change cancels the pending timer and aborts the request in flight, so
 * only the answer for the latest value can set or clear the error. Unmounting
 * the field does the same.
 *
 * @param url - The endpoint validating the value.
 * @param options - Request, debounce and error options.
 * @returns A middleware for any field.
 *
 * `import { addRESTValidation } from "@canonical/react-ds-global-form";`
 */
function addRESTFieldValidation(
  url: string,
  options: ValidationOptions = {},
): ValidationMiddleware {
  const {
    method = "POST",
    headers = { "Content-Type": "application/json" },
    bodyFormatter = (value: string) => ({ value }),
    errorExtractor = () => "Validation failed",
    minLength = 3,
    debounceWait = 300,
  } = options;

  /**
   * Sends the value and resolves to the error message, or `null` when valid.
   * @note Impure: performs a network request.
   */
  const fetchValidationError = async (
    value: string,
    signal: AbortSignal,
  ): Promise<string | null> => {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(bodyFormatter(value)),
      signal,
    });
    return response.ok ? null : errorExtractor(response);
  };

  return <Props extends BaseInputProps>(
    WrappedComponent: ComponentType<Props>,
  ) => {
    function WithRESTValidation(props: Props) {
      const { name } = props;
      const { setError, clearErrors } = useFormContext();
      const value: unknown = useWatch({ name });

      useEffect(() => {
        if (typeof value !== "string" || value.length < minLength) {
          clearErrors(name);
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
          fetchValidationError(value, controller.signal)
            .then((message) => {
              if (controller.signal.aborted) return;
              if (message === null) {
                clearErrors(name);
              } else {
                setError(name, { type: "manual", message });
              }
            })
            // A request that fails to complete says nothing about the value,
            // so it leaves the field's error as it is.
            .catch(() => {});
        }, debounceWait);
        return () => {
          clearTimeout(timer);
          controller.abort();
        };
      }, [value, name, setError, clearErrors]);

      return createElement(WrappedComponent, props);
    }
    return WithRESTValidation;
  };
}

export default addRESTFieldValidation;
