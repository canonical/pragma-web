<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TooltipStage from "../../../storybook/TooltipStage.svelte";
  import { Icon } from "../Icon/index.js";
  import Tooltip from "./Tooltip.svelte";

  /**
   * The presentational tooltip. Its arrow only appears when a placement class
   * (`top`/`bottom`/`left`/`right`) is set — that class is normally supplied
   * by the positioning layer (`TooltipEngine`). Here it is set directly so the
   * arrow is visible in isolation.
   */
  const { Story } = defineMeta({
    title: "Components/Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
    decorators: [() => ({ Component: TooltipStage })],
    parameters: { layout: "centered" },
    argTypes: {
      children: { control: false },
      icon: { control: false },
    },
  });
</script>

<Story name="Default" args={{ class: "top", isOpen: true }}>
  {#snippet template(args)}
    <Tooltip class={args.class} isOpen={args.isOpen} zIndex={args.zIndex}>Lorem ipsum dolor sit amet</Tooltip>
  {/snippet}
</Story>

<Story name="With icon" args={{ class: "top", isOpen: true }}>
  {#snippet template(args)}
    <Tooltip class={args.class} isOpen={args.isOpen} zIndex={args.zIndex}>
      {#snippet icon()}<Icon icon="information" />{/snippet}The standard tooltip explains an icon or control.
    </Tooltip>
  {/snippet}
</Story>

<Story name="Multiline" args={{ class: "top", isOpen: true }}>
  {#snippet template(args)}
    <Tooltip class={args.class} isOpen={args.isOpen} zIndex={args.zIndex}>
      {#snippet icon()}<Icon icon="information" />{/snippet}The standard tooltip explains an icon or control, or adds a short clarification that runs across several lines when the content is long.
    </Tooltip>
  {/snippet}
</Story>
