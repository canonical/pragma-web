<script lang="ts" module>
  /** An empty or whitespace-only label provides no accessible name. */
  const hasAccessibleName = (value: unknown): boolean =>
    typeof value === "string" && value.trim() !== "";
</script>

<script lang="ts">
  import type { IconProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds icon";

  const {
    xmlns = "http://www.w3.org/2000/svg",
    viewBox = "0 0 16 16",
    icon,
    class: className,
    rootPath = "/icons",
    role,
    ...rest
  }: IconProps = $props();

  // Icons are decorative by default and hidden from assistive technology.
  // Providing an accessible name (aria-label/aria-labelledby) or an explicit
  // role exposes the icon as a named image instead. An empty label counts as
  // decorative, mirroring the `alt=""` convention on images.
  const isLabelled = $derived(
    hasAccessibleName(rest["aria-label"]) ||
      hasAccessibleName(rest["aria-labelledby"]),
  );
</script>

<svg
  {xmlns}
  {viewBox}
  class={[componentCssClassName, className]}
  role={role ?? (isLabelled ? "img" : undefined)}
  aria-hidden={isLabelled || role ? undefined : true}
  {...rest}
><use href={`${rootPath}/${icon}.svg#${icon}`}></use></svg>

<!-- @component
Icon component that renders SVG icons from `@canonical/ds-assets`.

Icons are decorative by default (`aria-hidden="true"`). Pass an `aria-label`
(or `aria-labelledby`) when the icon conveys meaning on its own; it is then
exposed as a named `img` element.

`import { Icon } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Icon icon="user" />
<Icon icon="warning" aria-label="Warning" />
```

@implements ds:global.component.icon
-->
