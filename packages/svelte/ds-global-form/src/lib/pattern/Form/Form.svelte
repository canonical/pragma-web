<script lang="ts">
  import type { FormProps } from "./types.js";

  const componentCssClassName = "ds form";

  let { class: className, children, ...rest }: FormProps = $props();
</script>

<form class={[componentCssClassName, "subgrid", className]} {...rest}>{@render children?.()}</form>

<!-- @component
A form laid out as a subgrid of its parent grid, so its fields align on the
shared columns. Native form attributes, handlers and attachments (for example
SvelteKit's `enhance` through `fromAction`) are passed through to the `<form>`.

`import { Form } from "@canonical/svelte-ds-global-form";`

@implements ds:global.pattern.form
-->
