<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SurfaceBands from "../../../storybook/SurfaceBands.svelte";
  import { Card } from "./index.js";

  // Svelte 5 Storybook autodocs do not currently pick up component docs from
  // the component source reliably, so we inject the description here instead:
  // https://github.com/storybookjs/storybook/discussions/34104#discussioncomment-16084065

  /**
   * The card is a container that is designed to represent data objects that
   * share the same structure. Unlike the more flexible Tile, a card is designed
   * to have multiple units displayed beside one another, so it has a
   * predictable structure that allows the user to compare attributes across
   * data objects.
   *
   * A Card is a subgrid, so it needs a grid parent. That parent is supplied by
   * the addon's `grid` story param: `"showcase"` frames a lone card in a single
   * ~22rem column, centred in a tall canvas, at its intrinsic height.
   */
  const { Story } = defineMeta({
    title: "components/Card",
    component: Card,
    tags: ["autodocs"],
    parameters: { grid: "showcase" },
    argTypes: {
      children: { control: false },
    },
  });
</script>

<!--
The base card: a single padded content block. `Card.Content` is the core
API — the header, image, and footer shown in other stories are optional
extras, not part of the base card.
-->
<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <Card {...args}>
      <Card.Content>
        <h4>Build a bare-metal cloud on a Raspberry Pi cluster with MAAS</h4>
        <p class="p">
          The Raspberry Pi 4, with its fast CPU cores, up to 8 GB of RAM and
          tiny footprint, is a great option to run a cluster on. Provisioning is
          easy with <a href="https://maas.io">MAAS</a>.
        </p>
      </Card.Content>
    </Card>
  {/snippet}
</Story>

<!--
A full-bleed image above the content block.

`Card.Image` is not part of the core API.
-->
<Story name="WithImage">
  {#snippet template({ children: _, ...args })}
    <Card {...args}>
      <Card.Image src="https://assets.ubuntu.com/v1/5ce214a4-rpi.png" alt="" />
      <Card.Content>
        <h4>Build a bare-metal cloud on a Raspberry Pi cluster with MAAS</h4>
        <p class="p">
          The Raspberry Pi 4 is a great option to run a cluster on, and
          provisioning is easy with <a href="https://maas.io">MAAS</a>.
        </p>
      </Card.Content>
    </Card>
  {/snippet}
</Story>

<!--
A card with a header, content and footer. Only the content-bearing sections
pad themselves; the card frame applies no general padding and the image
bleeds edge to edge. The header is not a separate visual section: no divider
is drawn under it and it merges with the content below, so title and body
read as one region. The footer holds tags and labels, not CTAs or links —
those belong in `Card.Content`.

`Card.Header`, `Card.Image` and `Card.Footer` are **not core API** — the base
card is just `Card.Content`; these are optional sections layered on top.
-->
<Story name="HeaderContentFooter">
  {#snippet template({ children: _, ...args })}
    <Card {...args}>
      <Card.Image src="https://assets.ubuntu.com/v1/5ce214a4-rpi.png" alt="" />
      <Card.Header>
        <h4>Ubuntu 24.04 LTS</h4>
        <span class="p">Noble Numbat</span>
      </Card.Header>
      <Card.Content>
        <p class="p">
          The latest long-term support release, with ten years of security
          maintenance and a refreshed toolchain for developers and operators.
          <a href="https://ubuntu.com/download">Download</a> or read the
          <a href="https://ubuntu.com/blog">release notes</a>.
        </p>
      </Card.Content>
      <Card.Footer>
        <span class="p">LTS</span>
        <span class="p">Desktop</span>
        <span class="p">Server</span>
      </Card.Footer>
    </Card>
  {/snippet}
</Story>

<!--
The Card is not a surface: it sets no background of its own, so on each
surface it takes the *same* background as its container and reads as flush —
delimited only by its border and radius. Placed on three different surface
levels, the card blends with each rather than stepping to the next layer.
-->
<Story name="OnSurfaces" parameters={{ grid: "responsive" }}>
  {#snippet template()}
    <SurfaceBands>
      {#snippet children(level)}
        <Card>
          <Card.Content>
            <h4>On surface level {level + 1}</h4>
            <p class="p">
              The card takes the same background as the surface it sits on.
            </p>
          </Card.Content>
        </Card>
      {/snippet}
    </SurfaceBands>
  {/snippet}
</Story>
