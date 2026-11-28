<!-- Ported from @canonical/react-ds-app SideNavigation Header -->

<!--
@component
SideNavigation.Header — top region holding the brand (at the start) and the
collapse toggle (at the end). The toggle is omitted when no `ontoggle`
handler is provided. Collapsed: the layout switches to a centred column — the
toggle relocates below the logo rather than beside it — driven by
`data-expanded`.
-->

<script lang="ts">
  import { CollapseToggle } from "../CollapseToggle/index.js";
  import type { HeaderProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-header";

  let {
    class: className,
    brand,
    applicationName,
    expanded,
    ontoggle,
    collapseControls,
    collapseToggleMessages,
    ...rest
  }: HeaderProps = $props();
</script>

<header
	class={[componentCssClassName, className]}
	data-expanded={expanded}
	{...rest}
>
	<div class="brand-container">
		<div class="brand">{@render brand?.()}</div>
		<!-- Optional, consumer-supplied. Hidden when collapsed — the spec's
		     collapsed header has no title. -->
		{#if applicationName != null}
			<h1 class="title">{#if typeof applicationName === "string"}{applicationName}{:else}{@render applicationName()}{/if}</h1>
		{/if}
	</div>
	{#if ontoggle}
		<CollapseToggle
			{expanded}
			aria-controls={collapseControls}
			messages={collapseToggleMessages}
			onclick={ontoggle}
		/>
	{/if}
</header>
