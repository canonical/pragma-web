<script lang="ts">
  import { Field } from "../lib/pattern/Field/index.js";
  import type {
    RESTValidationOptions,
    RemoteCheck,
  } from "../lib/utils/middleware/types.js";
  import validateRemotely from "../lib/utils/middleware/validateRemotely.js";

  // Renders a text field checked by `validateRemotely`, in a form whose
  // submits are recorded instead of posted.
  let {
    validator,
    second,
    options = {},
    isInForm = true,
    novalidate = false,
    onsubmit,
    condition,
  }: {
    validator?: string | RemoteCheck;
    second?: RemoteCheck;
    options?: RESTValidationOptions;
    isInForm?: boolean;
    novalidate?: boolean;
    onsubmit?: (event: SubmitEvent) => void;
    condition?: () => boolean;
  } = $props();
</script>

{#snippet field()}<Field
    inputType="text"
    name="username"
    label="Username"
    {condition}
    {@attach validator ? validateRemotely(validator, options) : undefined}
    {@attach second ? validateRemotely(second, options) : undefined}
  />{/snippet}

{#if isInForm}<form
    {novalidate}
    onsubmit={(event) => {
      event.preventDefault();
      onsubmit?.(event);
    }}
    >{@render field()}<button type="submit">Send</button></form
  >{:else}{@render field()}{/if}
