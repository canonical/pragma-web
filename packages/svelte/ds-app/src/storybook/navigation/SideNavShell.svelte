<!-- Ported from @canonical/react-ds-app storybook/navigation/story-utils -->

<!--
@component
Wraps a subcomponent story in the SideNavigation root context
(`.ds.side-navigation`) so the shared row-inset custom properties and the
navigation surface tokens resolve. `list` adds the `<ul>` a row needs.
Story-only.
-->

<script lang="ts">
  import type { Snippet } from "svelte";
  import "../../lib/component/SideNavigation/styles.css";

  interface Props {
    /** Wrap the content in a `<ul class="list">`, for a single row. */
    list?: boolean;
    children?: Snippet;
  }

  let { list = false, children }: Props = $props();
</script>

<div class="surface">
	<div class="ds side-navigation">
		{#if list}
			<ul class="list" style="list-style: none; margin: 0; padding: 0">
				{@render children?.()}
			</ul>
		{:else}
			{@render children?.()}
		{/if}
	</div>
</div>
