<script lang="ts">
  import type { LinkProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds link";

  let { class: className, children, appearance, ...rest }: LinkProps = $props();
</script>

<a class={[componentCssClassName, className, appearance]} {...rest}>
  {@render children?.()}
</a>

<!-- @component
`Link` is a styled anchor element.

## Example Usage
```svelte
<Link href="https://ubuntu.com" target="_blank" rel="noopener">
  Canonical
</Link>
```

@implements ds:global.component.link
-->
