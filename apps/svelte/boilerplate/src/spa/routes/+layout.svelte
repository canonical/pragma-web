<script lang="ts">
  import RootLayout from "../../layouts/RootLayout.svelte";
  import setTheme from "../../lib/ThemeSelector/setTheme.js";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();

  // Applies the stored theme to <html> once the page is in the browser: the
  // static fallback page has no server to render the class, as the SSR build
  // does. It runs once, since the stored theme only changes through the
  // selector, which applies changes itself.
  $effect(() => {
    setTheme(data.theme);
  });
</script>

<RootLayout locale={data.locale}>{@render children()}</RootLayout>
