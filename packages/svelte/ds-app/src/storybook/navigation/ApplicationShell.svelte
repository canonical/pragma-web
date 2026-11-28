<!-- Ported from @canonical/react-ds-app storybook/navigation/story-utils -->

<!--
@component
Frames a SideNavigation story in a page-like grid: the rail's own column and
a placeholder main region (`#main-content`, the skip link's target) filling
the rest. Stacks below the rail's 620px breakpoint. Story-only.
-->

<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="surface app-shell-layout">
	{@render children?.()}
	<main id="main-content" class="main">
		{#each { length: 8 }, paragraph (paragraph)}
			<p>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
				tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
				veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
				commodo consequat.
			</p>
		{/each}
	</main>
</div>

<style>
	.app-shell-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: 100dvh;
		gap: 1rem;
		background: var(--surface-color-background);
	}

	.main {
		min-block-size: 0;
		overflow: auto;
		padding-inline: 1rem;
	}

	@media (width < 620px) {
		.app-shell-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			block-size: 100dvh;
		}
	}
</style>
