import type { Option } from "../../subcomponent/types.js";
import type { FieldValidator } from "../owner/types.js";

/** A control whose value `validateRemotely` checks. */
export type ValidatedControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

/** When `validateRemotely` checks a value, and how long it waits for an answer. */
export type RemoteValidationOptions = {
  /** Shortest value that is checked. Shorter values clear the message. Defaults to 3. */
  minLength?: number;
  /** Milliseconds to wait after the last change before checking. Defaults to 300. */
  debounceWait?: number;
  /**
   * Milliseconds to wait for the check's answer before giving up, so a check
   * that never settles cannot hold a submit. Defaults to 10000.
   */
  timeout?: number;
};

/** How `validateRemotely` asks a REST endpoint about a value. */
export type RESTValidationOptions = RemoteValidationOptions & {
  /** HTTP method of the validation request. Defaults to `"POST"`. */
  method?: string;
  /** Headers sent with the validation request. Default to a JSON content type. */
  headers?: Record<string, string>;
  /** Builds the JSON request body from the value. Defaults to `{ value }`. */
  bodyFormatter?: (value: string) => unknown;
  /** Reads the message from a rejecting response. Defaults to "Validation failed". */
  errorExtractor?: (response: Response) => Promise<string> | string;
};

/**
 * A remote check of a string value: resolves to its message, or `undefined`
 * when the value is valid. A rejection means no answer.
 */
export type RemoteCheck = FieldValidator<string>;

/** How `fetchOptions` requests options and reads the response. */
export type OptionsFetchOptions<Data = Option[]> = {
  /** HTTP method of the options request. Defaults to `"GET"`. */
  method?: string;
  /** Headers sent with the options request. */
  headers?: Record<string, string>;
  /**
   * Turns the response body into options. Without it the body must already be
   * an `Option[]`.
   */
  transformData?: (data: Data) => Option[];
  /** The `fetch` to use, such as the one SvelteKit passes to `load`. */
  fetch?: typeof fetch;
  /** Aborts the request. */
  signal?: AbortSignal;
};

/** The props `createRemoteOptions` gives a field, to spread onto it. */
export type RemoteOptionsFieldProps = {
  readonly options: readonly Option[];
  readonly disabled: true | undefined;
  readonly "aria-busy": true | undefined;
  readonly error: string | undefined;
};

/** The state of options fetched by `createRemoteOptions`. */
export type RemoteOptions = {
  /** The fetched options; empty while loading and after a failure. */
  readonly options: readonly Option[];
  /** Is a request for the current URL running. */
  readonly isLoading: boolean;
  /** The message of the failed request for the current URL, if any. */
  readonly error: string | undefined;
  /**
   * `options`, `error`, and `disabled` and `aria-busy` while loading, to
   * spread onto a field before its own props.
   */
  readonly fieldProps: RemoteOptionsFieldProps;
};
