<script lang="ts">
  import { ApplicationLayout } from "@canonical/svelte-ds-app";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import CanonicalLogo from "../CanonicalLogo/index.js";
  import SideNavigation from "./common/SideNavigation/index.js";
  import type { ApplicationShellProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds application-shell";

  let {
    root,
    footerRoot,
    label,
    currentUrl,
    children,
    class: className,
    ...rest
  }: ApplicationShellProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<div {...rest} class={[componentCssClassName, "surface", className]}>
  <ApplicationLayout>
    {#snippet navigation()}
      <SideNavigation aria-label={label} applicationName={t("app.name")} {currentUrl} {footerRoot} messages={{ skipToContent: () => t("shell.skipToContent") }} {root}>
        {#snippet brand()}<CanonicalLogo {currentUrl} />{/snippet}
      </SideNavigation>
    {/snippet}
    <main class="main" id="main-content">{@render children?.()}</main>
  </ApplicationLayout>
</div>

<!-- @component
An application's frame: the design system's `ApplicationLayout`, with the side
navigation in the navigation slot and the page in `<main>`.

The side navigation follows the page: `currentUrl` marks the active item.
`<main id="main-content">` is the side navigation's skip-link target. Until
`@canonical/svelte-ds-app` ships `SideNavigation`, the slot holds a stand-in
with the same props.

The shell is a `.surface`: the design system's components read their colours
from the surface channels it sets, and the side panels and modals opened inside
it paint from them.

`import { ApplicationShell } from "$lib";`
-->
