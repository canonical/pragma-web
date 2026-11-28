<script lang="ts">
  import type { InlineCodeProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds inline-code";

  const { class: className, children, ...rest }: InlineCodeProps = $props();
</script>

<code class={[componentCssClassName, "code", className]} {...rest}>
  {@render children?.()}
</code>

<!-- @component
This component is used to display code inline or as a standalone block.

`import { InlineCode } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<p class="p">Run <InlineCode>snap install juju</InlineCode> first.</p>
```

@implements ds:global.component.inline_code
-->
