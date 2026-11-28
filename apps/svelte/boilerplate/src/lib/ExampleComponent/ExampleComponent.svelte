<script lang="ts">
  import type { ExampleComponentProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds example-component";

  let { class: className, children, ...rest }: ExampleComponentProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>{@render children?.()}</div>

<!-- @component
A plain component scaffolded alongside the app: the starting point for your own
components.

`import { ExampleComponent } from "$lib";`
-->
