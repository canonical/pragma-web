<script lang="ts">
  import type { IconProps } from "./types.js";

  const componentCssClassName = "ds icon";

  let { name, class: className, ...rest }: IconProps = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class={[componentCssClassName, className]} aria-hidden="true" {...rest}><use href={`/icons/${name}.svg#${name}`}></use></svg>

<!-- @component
A design-system glyph from the `/icons` sprite route, with the markup of React's
`Icon`. A stand-in until `@canonical/svelte-ds-global` ships an Icon.

`import { Icon } from "$lib";`
-->
