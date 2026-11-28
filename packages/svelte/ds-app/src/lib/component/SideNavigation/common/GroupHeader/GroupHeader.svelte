<!-- Ported from @canonical/react-ds-app SideNavigation GroupHeader -->

<!--
@component
SideNavigation.GroupHeader — the optional label above a SideNavigation.Group's
entries. Purely presentational; rendered by Group when its `label` is set.
-->

<script lang="ts">
  import type { GroupHeaderProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-group-header";

  let { children, class: className, ...rest }: GroupHeaderProps = $props();
</script>

<!-- `title` — native tooltip fallback for a truncated header. Only
     meaningful when the header is plain text. -->
<span
	class={[componentCssClassName, className]}
	title={typeof children === "string" ? children : undefined}
	{...rest}
>{#if typeof children === "string"}{children}{:else}{@render children?.()}{/if}</span>
