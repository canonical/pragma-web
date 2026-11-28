<!-- Ported from @canonical/react-ds-app SideNavigation Group -->

<!--
@component
SideNavigation.Group — a named collection of navigation entries, with an
optional SideNavigation.GroupHeader. One of NavTree's direct content entries.
Starts with a divider when `divider` is set (every group but the first).
-->

<script lang="ts">
  import { GroupHeader } from "../GroupHeader/index.js";
  import type { GroupProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-group";

  let {
    label,
    // The divider is hidden for now (operator, 2026-11-28); restore the render below.
    divider: _divider = false,
    children,
    class: className,
    ...rest
  }: GroupProps = $props();
</script>

<section class={[componentCssClassName, className]} {...rest}>
	<!-- {#if divider}<hr class="divider" />{/if} -->
	{#if label != null}<GroupHeader children={label} />{/if}
	<ul class="list">{@render children?.()}</ul>
</section>
