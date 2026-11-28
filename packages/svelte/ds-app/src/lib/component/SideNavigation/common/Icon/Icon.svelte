<!-- The markup of @canonical/react-ds-global Icon -->

<!--
@component
Icon — an icon from `@canonical/ds-assets`, rendered as the design-system
Icon renders it. The Svelte design system has no Icon yet, so SideNavigation
keeps this private copy of its markup and styles.

Decorative by default (`aria-hidden="true"`); an accessible name or an
explicit `role` exposes it as an image.
-->

<script lang="ts">
  import type { IconProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds icon";

  let {
    xmlns = "http://www.w3.org/2000/svg",
    viewBox = "0 0 16 16",
    icon,
    class: className,
    rootPath = "/icons",
    role,
    ...rest
  }: IconProps = $props();

  /** An empty or whitespace-only label provides no accessible name. */
  const hasAccessibleName = (value: unknown): boolean =>
    typeof value === "string" && value.trim() !== "";

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
	aria-hidden={isLabelled || role ? undefined : "true"}
	{...rest}
><use href={`${rootPath}/${icon}.svg#${icon}`}></use></svg>
