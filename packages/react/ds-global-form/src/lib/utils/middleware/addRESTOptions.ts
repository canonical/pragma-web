import {
  type ComponentProps,
  createElement,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import type { BaseInputProps } from "../../common/types.js";
import createMiddleware, {
  type ConfiguredMiddleware,
  type MiddlewareBuilder,
} from "../../common/Wrapper/createMiddleware.js";
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
type OptionsMiddleware = ConfiguredMiddleware<OptionsFieldProps>;

type OptionsStatus = "loading" | "ready" | "failed";

/** The settings of one options middleware, with its defaults applied. */
type OptionsSettings = {
  url: string;
  method: string;
  headers: Record<string, string>;
  transform: (data: unknown) => Option[];
};

/** The options of a field before, or without, a successful request. */
const NO_OPTIONS: Option[] = [];

/** Reads a displayable message from whatever a failed request rejected with. */
const readErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Requests the options and transforms the body.
 * @note Impure: performs a network request.
 */
const requestOptions = async (
  url: string,
  { method, headers, transform }: OptionsSettings,
  signal: AbortSignal,
): Promise<Option[]> => {
  const response = await fetch(url, { method, headers, signal });
  if (!response.ok) {
    throw new Error("Failed to fetch options");
  }
  return transform(await response.json());
};

/** Builds the component that fetches the options and passes them on. */
const buildRESTOptions: MiddlewareBuilder<
  OptionsSettings,
  OptionsFieldProps
> = (WrappedComponent, useSettings) => {
  function WithRESTOptions(props: ComponentProps<typeof WrappedComponent>) {
    const { name } = props;
    const settings = useSettings();
    const { url } = settings;
    const { setError, clearErrors, getFieldState } = useFormContext();
    const [status, setStatus] = useState<OptionsStatus>("loading");
    const [fetchedOptions, setFetchedOptions] = useState(NO_OPTIONS);

    // The request reads the newest method, headers and transform, but only a
    // new URL starts one.
    const fetchOptions = useEffectEvent(
      (requestUrl: string, signal: AbortSignal) =>
        requestOptions(requestUrl, settings, signal),
    );

    useEffect(() => {
      const controller = new AbortController();
      /** Clears the field's error when this middleware set it. */
      const clearOwnError = () => {
        if (getFieldState(name).error?.type === REST_OPTIONS_ERROR_TYPE) {
          clearErrors(name);
        }
      };
      // The failure of the previous URL is part of its answer: drop it too.
      clearOwnError();
      setStatus("loading");
      setFetchedOptions(NO_OPTIONS);
      fetchOptions(url, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          setFetchedOptions(result);
          setStatus("ready");
          clearOwnError();
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
    }, [url, name, setError, clearErrors, getFieldState]);

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

const configureRESTOptions = createMiddleware(buildRESTOptions);

/**
 * Fetches a field's options from a REST endpoint and passes them as the
 * `options` prop.
 *
 * The field keeps its normal markup in every state. While loading it is
 * disabled, marked `aria-busy`, and has no options. A failed request is set as
 * the field's error, so it shows where the field shows any other error, and
 * leaves the field enabled. The middleware can be created inline: the field
 * keeps one instance, which fetches again only when the URL changes, and
 * drops the answer for the previous URL, its error included. The request is
 * aborted when the field unmounts. Use one per field: an inner instance's
 * options replace the outer one's.
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
  return configureRESTOptions({
    url,
    method,
    headers,
    transform: (data) =>
      transformData ? transformData(data as Data) : (data as Option[]),
  });
}

export default addRESTFieldOptions;
