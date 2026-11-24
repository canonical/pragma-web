import { type ComponentType, createElement, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { BaseInputProps } from "../../common/types.js";
import type { Option } from "../../subcomponent/types.js";

/** The error type the middleware sets, so it only ever clears its own error. */
const REST_OPTIONS_ERROR_TYPE = "restOptions";

interface OptionsFetchOptions<Data> {
  /** HTTP method of the options request. Defaults to `"GET"`. */
  method?: string;
  /** Headers sent with the options request. */
  headers?: Record<string, string>;
  /**
   * Turns the response body into options. Without it the body must already be
   * an `Option[]`.
   */
  transformData?: (data: Data) => Option[];
}

/** Props the options middleware reads from, and writes to, the field. */
type OptionsFieldProps = BaseInputProps & {
  options?: Option[];
  disabled?: boolean;
};

/** A middleware that works with any field taking `options`. */
type OptionsMiddleware = <Props extends OptionsFieldProps>(
  Component: ComponentType<Props>,
) => ComponentType<Props>;

type OptionsStatus = "loading" | "ready" | "failed";

/** Reads a displayable message from whatever a failed request rejected with. */
const readErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Fetches a field's options from a REST endpoint and passes them as the
 * `options` prop.
 *
 * The field keeps its normal markup in every state. While loading it is
 * disabled, marked `aria-busy`, and has no options. A failed request is set as
 * the field's error, so it shows where the field shows any other error. The
 * request is aborted when the field unmounts, and a different URL means a new
 * middleware, so the field remounts and fetches again.
 *
 * @param url - The endpoint returning the options.
 * @param options - Request and transform options.
 * @returns A middleware for any field that takes `options`.
 *
 * `import { addRESTOptions } from "@canonical/react-ds-global-form";`
 */
function addRESTFieldOptions<Data = Option[]>(
  url: string,
  options: OptionsFetchOptions<Data> = {},
): OptionsMiddleware {
  const { method = "GET", headers = {}, transformData } = options;

  /**
   * Requests the options and transforms the body.
   * @note Impure: performs a network request.
   */
  const fetchOptions = async (signal: AbortSignal): Promise<Option[]> => {
    const response = await fetch(url, { method, headers, signal });
    if (!response.ok) {
      throw new Error("Failed to fetch options");
    }
    const data = await response.json();
    return transformData ? transformData(data) : data;
  };

  return <Props extends OptionsFieldProps>(
    WrappedComponent: ComponentType<Props>,
  ) => {
    function WithRESTOptions(props: Props) {
      const { name } = props;
      const { setError, clearErrors, getFieldState } = useFormContext();
      const [status, setStatus] = useState<OptionsStatus>("loading");
      const [fetchedOptions, setFetchedOptions] = useState<Option[]>([]);

      useEffect(() => {
        const controller = new AbortController();
        fetchOptions(controller.signal)
          .then((result) => {
            if (controller.signal.aborted) return;
            setFetchedOptions(result);
            setStatus("ready");
            if (getFieldState(name).error?.type === REST_OPTIONS_ERROR_TYPE) {
              clearErrors(name);
            }
          })
          .catch((error: unknown) => {
            if (controller.signal.aborted) return;
            setStatus("failed");
            setError(name, {
              type: REST_OPTIONS_ERROR_TYPE,
              message: readErrorMessage(error),
            });
          });
        return () => controller.abort();
      }, [name, setError, clearErrors, getFieldState]);

      const isLoading = status === "loading";
      return createElement(WrappedComponent, {
        ...props,
        options: fetchedOptions,
        disabled: props.disabled || isLoading,
        "aria-busy": isLoading || undefined,
      });
    }
    return WithRESTOptions;
  };
}

export default addRESTFieldOptions;
