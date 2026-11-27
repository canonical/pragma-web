import { untrack } from "svelte";
import type { Option } from "../../subcomponent/types.js";
import fetchOptions from "./fetchOptions.js";
import type { OptionsFetchOptions, RemoteOptions } from "./types.js";

type Status = "loading" | "ready" | "failed";

/** The options of a field before, or without, a successful request. */
const NO_OPTIONS: readonly Option[] = [];

/** Reads a displayable message from whatever a failed request rejected with. */
const readErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Fetches a field's options in the browser, and fetches them again whenever
 * the URL changes. Spread `fieldProps` onto the field, before its own props:
 *
 * ```svelte
 * <script>
 *   const fruits = createRemoteOptions(() => `/api/fruits?season=${season}`);
 * </script>
 *
 * <Field inputType="select" name="fruit" label="Fruit" {...fruits.fieldProps} />
 * ```
 *
 * The field keeps its normal markup in every state. While loading it is
 * disabled, marked `aria-busy`, and has no options. A failed request becomes
 * the field's `error` and leaves the field enabled. A new URL aborts the
 * previous request and clears its options and error while the new ones load,
 * and an answer for an earlier URL is dropped. Requests run in an `$effect`, so
 * nothing is fetched on the server: for server rendering, fetch the options in
 * a SvelteKit `load` with `fetchOptions` and pass them as `options`.
 *
 * @param readUrl - Returns the endpoint; the options are fetched again when it
 * returns a new URL.
 * @param options - Request and transform options, read when a request starts.
 * @returns The options and request state, as reactive getters.
 * @note Impure: creates an effect that performs network requests; call during
 * component initialisation.
 */
export default function createRemoteOptions<Data = Option[]>(
  readUrl: () => string,
  options: Omit<OptionsFetchOptions<Data>, "signal"> = {},
): RemoteOptions {
  let fetched = $state.raw(NO_OPTIONS);
  let status = $state<Status>("loading");
  let error = $state<string>();

  // A derived URL, so the effect re-runs only for a different string, not
  // whenever something `readUrl` reads is updated.
  const currentUrl = $derived(readUrl());

  $effect(() => {
    const url = currentUrl;
    const controller = new AbortController();
    fetched = NO_OPTIONS;
    status = "loading";
    error = undefined;
    // Only the URL starts a request: the options, and anything the request
    // reads before its first await, are not tracked.
    untrack(() =>
      fetchOptions(url, { ...options, signal: controller.signal }),
    ).then(
      (result) => {
        if (controller.signal.aborted) return;
        fetched = result;
        status = "ready";
      },
      (reason: unknown) => {
        if (controller.signal.aborted) return;
        error = readErrorMessage(reason);
        status = "failed";
      },
    );
    return () => controller.abort();
  });

  const isLoading = $derived(status === "loading");
  const fieldProps = $derived({
    options: fetched,
    disabled: isLoading || undefined,
    "aria-busy": isLoading || undefined,
    error,
  } as const);

  return {
    get options() {
      return fetched;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get fieldProps() {
      return fieldProps;
    },
  };
}
