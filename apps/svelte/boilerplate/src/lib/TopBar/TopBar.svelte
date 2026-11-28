<script lang="ts">
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import Navigation from "../Navigation/index.js";
  import type { TopBarProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds top-bar";

  let { currentUrl, theme, class: className, ...rest }: TopBarProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<header {...rest} class={[componentCssClassName, "surface", className]}><a class="name" aria-current={currentUrl === "/" ? "page" : undefined} href="/">{t("app.name")}</a><Navigation {currentUrl} {theme} /></header>

<!-- @component
The bar across the top of every page: the application's name, then the demo
navigation — one link per area of the boilerplate, followed by the theme and
language selectors. It is scaffolding for exploring what the boilerplate ships;
an application replaces the links with its own.

It sits above both page layouts: the public pages' constrained column and the
dashboard's application shell. It is a `.surface`, so the selectors read the
surface channels the design system's inputs expect.

`import { TopBar } from "$lib";`
-->
