<script lang="ts">
  import type { Snippet } from "svelte";
  import { TopBar } from "../lib/index.js";
  import type { ThemePreference } from "../lib/ThemeSelector/index.js";

  let {
    currentUrl,
    theme,
    children,
  }: {
    /** The current page's pathname. */
    currentUrl: string;
    /** The theme preference the page was rendered with. */
    theme: ThemePreference;
    /** The page, in its page layout. */
    children?: Snippet;
  } = $props();
</script>

<div class="page-frame">
  <TopBar {currentUrl} {theme} />
  {@render children?.()}
</div>

<!-- @component
The outer frame of every page except the 404: the top bar, then whichever page
layout the route group adds inside it.
-->
