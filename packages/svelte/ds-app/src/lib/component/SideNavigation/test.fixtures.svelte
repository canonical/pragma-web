<script lang="ts" module>
  import type { LinkAttributes } from "./types.js";

  /** Text the snippets below render, for assertions. */
  export const fixtureText = {
    brand: "Acme",
    brandLink: "Home",
    slot: "3",
    badge: "2",
    richLabel: "New workspace",
    richItem: "Machines",
  };

  export {
    badge,
    brand,
    brandLink,
    customLink,
    expandableChildren,
    groupChildren,
    linkAndButtonChildren,
    linkChildren,
    packagesChildren,
    plainLabelChildren,
    richItem,
    richLabel,
    slot,
  };
</script>

{#snippet brand()}<span>{fixtureText.brand}</span>{/snippet}
{#snippet brandLink()}<a href="/">{fixtureText.brandLink}</a>{/snippet}
{#snippet slot()}<span>{fixtureText.slot}</span>{/snippet}
{#snippet badge()}<span>{fixtureText.badge}</span>{/snippet}
{#snippet richLabel()}<strong>{fixtureText.richLabel}</strong>{/snippet}
{#snippet richItem()}<strong>{fixtureText.richItem}</strong>{/snippet}
{#snippet customLink(attributes: LinkAttributes, content: import("svelte").Snippet)}<a {...attributes} href={`#${attributes.href}`}>{@render content()}</a>{/snippet}
{#snippet groupChildren()}<li>Machines</li>{/snippet}
{#snippet expandableChildren()}<li>Machines</li>{/snippet}
{#snippet packagesChildren()}<li>Packages</li>{/snippet}
{#snippet linkAndButtonChildren()}<li><a href="/profile">Profile</a></li><li><button type="button">Log out</button></li>{/snippet}
{#snippet linkChildren()}<li><a href="/machines">Machines</a></li>{/snippet}
{#snippet plainLabelChildren()}<li><span>Plain label</span></li>{/snippet}
