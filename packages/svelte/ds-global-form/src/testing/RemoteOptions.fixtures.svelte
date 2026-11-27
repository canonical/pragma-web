<script lang="ts">
  import { Field } from "../lib/pattern/Field/index.js";
  import createRemoteOptions from "../lib/utils/middleware/createRemoteOptions.svelte.js";
  import type { OptionsFetchOptions } from "../lib/utils/middleware/types.js";

  // Renders a select whose options `createRemoteOptions` fetches from `url`,
  // and prints the request state.
  let {
    url,
    options = {},
  }: { url: string; options?: Omit<OptionsFetchOptions<unknown>, "signal"> } =
    $props();

  // svelte-ignore state_referenced_locally
  const remote = createRemoteOptions(() => url, options);
</script>

<Field inputType="select" name="fruit" label="Fruit" {...remote.fieldProps} />
<output data-testid="state">{JSON.stringify({ isLoading: remote.isLoading, error: remote.error ?? null, options: remote.options.map((option) => option.value) })}</output>
