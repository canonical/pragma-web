<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TooltipStage from "../../../storybook/TooltipStage.svelte";
  import type { WindowFitmentSide } from "../../hooks/index.js";
  import { Button } from "../Button/index.js";
  import { Icon } from "../Icon/index.js";
  import TooltipEngine from "./TooltipEngine.svelte";

  /**
   * Wraps a target with a hover/focus tooltip. Tooltips are `position: fixed`
   * and portalled to the body, so on the docs page every open-by-default
   * tooltip would pile up at the same viewport coordinates: the stories
   * force the tooltip open only in the isolated story view, and leave it
   * hover-driven on the docs page.
   */
  const { Story } = defineMeta({
    title: "Components/Tooltip/TooltipEngine",
    component: TooltipEngine,
    tags: ["autodocs"],
    decorators: [() => ({ Component: TooltipStage })],
    parameters: { layout: "centered" },
    globals: { backgrounds: { value: "dark" } },
    argTypes: {
      children: { control: false },
      message: { control: false },
      icon: { control: false },
    },
  });

  /** Force-open in the isolated story view; hover-driven in docs. */
  const openIn = (viewMode: string | undefined) =>
    viewMode === "docs" ? undefined : true;

  const changeableOptions: WindowFitmentSide[] = [
    "block-start",
    "inline-end",
    "block-end",
    "inline-start",
  ];

  const quadrants: { side: WindowFitmentSide; label: string }[] = [
    { side: "block-start", label: "Above" },
    { side: "inline-end", label: "Inline end" },
    { side: "inline-start", label: "Inline start" },
    { side: "block-end", label: "Below" },
  ];

  const autoFitMessage =
    "The standard tooltip explains an icon or control, or adds a longer clarification that runs across several lines and is wide enough that a cell near the right edge — like the ninth — has no room on its preferred side and flips to the opposite one.";
</script>

<script lang="ts">
  let changeIndex = $state(0);
  const changeDirection = $derived(
    changeableOptions[changeIndex % changeableOptions.length],
  );

  let playground: HTMLDivElement | undefined = $state();
  let dragging = $state(false);
  let position = $state({ x: 50, y: 15 });

  const moveTo = (clientX: number, clientY: number) => {
    if (!playground) return;
    const rect = playground.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    position = { x: Math.round(x), y: Math.round(y) };
  };
</script>

{#snippet informationIcon()}<Icon icon="information" />{/snippet}

<!--
  The minimal form: wrap a target with a message. Hover the button to reveal
  the tooltip.
-->
<Story name="Default">
  {#snippet template()}
    <TooltipEngine>
      {#snippet message()}<span>Tooltip content</span>{/snippet}
      <Button importance="tertiary">Hover me</Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  A tooltip can carry a leading icon (Figma: 16px glyph, dimension-100 gap,
  always before the text). The icon is decorative — the message carries the
  meaning.
-->
<Story name="With icon">
  {#snippet template(_, context)}
    <TooltipEngine
      icon={informationIcon}
      preferredDirections={["block-start"]}
      open={openIn(context.viewMode)}
    >
      {#snippet message()}The standard tooltip explains an icon or control.{/snippet}
      <Button importance="tertiary">Icon tooltip</Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  Long messages wrap at the tooltip's max-width (284px). Explicit newlines in
  the message are still honoured.
-->
<Story name="Multiline">
  {#snippet template(_, context)}
    <TooltipEngine
      icon={informationIcon}
      preferredDirections={["block-start"]}
      open={openIn(context.viewMode)}
    >
      {#snippet message()}The standard tooltip explains an icon or control, or adds a short clarification that runs across several lines when the content is long.{/snippet}
      <Button importance="tertiary">Long tooltip</Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  The tooltip's max-width defaults to the `--tooltip-max-width` token (284px).
  This story exposes the `maxWidth` option as a control so the wrapping width
  can be tested.
-->
<Story
  name="Max width"
  args={{ maxWidth: "284px" }}
  argTypes={{ maxWidth: { control: "text" } }}
>
  {#snippet template(args, context)}
    <TooltipEngine
      maxWidth={args.maxWidth}
      preferredDirections={["block-start"]}
      open={openIn(context.viewMode)}
    >
      {#snippet message()}The standard tooltip explains an icon or control, or adds a short clarification that wraps at the configured maximum width.{/snippet}
      <Button importance="tertiary">Max width: {args.maxWidth}</Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  The tooltip can be aligned along a side, not only centred. Here it opens to
  the reading-flow side (`inline-end`), top-aligned to the anchor
  (`align: "start"`).
-->
<Story name="Lateral top aligned">
  {#snippet template(_, context)}
    <TooltipEngine
      preferredDirections={[{ side: "inline-end", align: "start" }]}
      open={openIn(context.viewMode)}
    >
      {#snippet message()}Aligned to the top of the anchor, on its trailing side.{/snippet}
      <Button importance="tertiary">Side, top-aligned</Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  Auto-fit, shown by a 3×3 grid of the same tooltip. Every cell prefers to
  open its tooltip to the right; cells near an edge flip to the opposite side.
  All closed by default — hover a button to see where its tooltip lands.
-->
<Story name="Auto fit">
  {#snippet template()}
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: clamp(24px, 8vw, 96px); inline-size: min(92vw, 760px); block-size: min(84vh, 520px); place-items: center;"
    >
      {#each Array.from({ length: 9 }, (_, i) => i) as i (i)}
        <TooltipEngine
          preferredDirections={["inline-end", "block-end", "inline-start", "block-start"]}
          autoFit
          icon={informationIcon}
        >
          {#snippet message()}{autoFitMessage}{/snippet}
          <Button importance="primary" anticipation="constructive">{i + 1}</Button>
        </TooltipEngine>
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  A single anchor you can drag around the stage to watch auto-fit flip and
  the arrow stay pinned to the anchor.
-->
<Story name="Auto fit playground" decorators={[]}>
  {#snippet template(_, context)}
    <div
      bind:this={playground}
      class="surface"
      role="presentation"
      style="position: relative; inline-size: min(90vw, 720px); block-size: min(80vh, 480px); background: var(--surface-color-background); color: var(--surface-color-text); outline: 1px dashed color-mix(in srgb, currentColor 25%, transparent); touch-action: none;"
      onpointermove={(event) => {
        if (dragging) moveTo(event.clientX, event.clientY);
      }}
      onpointerup={() => (dragging = false)}
      onpointerleave={() => (dragging = false)}
    >
      <div
        style="position: absolute; left: {position.x}%; top: {position.y}%; transform: translate(-50%, -50%);"
      >
        <TooltipEngine
          preferredDirections={["block-start", "block-end", "inline-end", "inline-start"]}
          autoFit
          open={openIn(context.viewMode)}
        >
          {#snippet message()}I stay on screen and my arrow stays pinned to the anchor.{/snippet}
          <Button
            importance="tertiary"
            style="cursor: {dragging ? 'grabbing' : 'grab'}; inline-size: 9rem; justify-content: center;"
            onpointerdown={(event) => {
              dragging = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
            }}
          >
            {#snippet icon()}<Icon icon="drag" />{/snippet}
            Move me
          </Button>
        </TooltipEngine>
      </div>
    </div>
  {/snippet}
</Story>

<!--
  The `message` and `preferredDirections` follow state: click the button to
  cycle the side.
-->
<Story name="Changeable">
  {#snippet template()}
    <TooltipEngine preferredDirections={[changeDirection]}>
      {#snippet message()}{changeDirection}{/snippet}
      <Button
        importance="primary"
        anticipation="constructive"
        onclick={() => (changeIndex += 1)}
      >
        Click to change direction
      </Button>
    </TooltipEngine>
  {/snippet}
</Story>

<!--
  The four placements at once: a 2×2 matrix, each button with a
  manually-configured side, so every tooltip opens into the canvas.
-->
<Story name="Placements">
  {#snippet template(_, context)}
    <div
      style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); place-items: center; gap: clamp(48px, 12vw, 140px); inline-size: min(88vw, 640px); block-size: min(72vh, 420px);"
    >
      {#each quadrants as { side, label } (side)}
        <TooltipEngine
          preferredDirections={[side]}
          open={openIn(context.viewMode)}
        >
          {#snippet message()}Opens {label.toLowerCase()}{/snippet}
          <Button importance="primary" anticipation="constructive">{label}</Button>
        </TooltipEngine>
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  A tooltip on an inline element inside a paragraph — the wrapper span sits
  in the text flow and the tooltip anchors to it.
-->
<Story name="Inline">
  {#snippet template()}
    <p>
      I am a paragraph using a&nbsp;<TooltipEngine>
        {#snippet message()}This is a tooltip describing the word{/snippet}
        <a href="#top">word</a>
      </TooltipEngine>&nbsp;that needs further explanation, which will be
      provided via a tooltip.
    </p>
  {/snippet}
</Story>
