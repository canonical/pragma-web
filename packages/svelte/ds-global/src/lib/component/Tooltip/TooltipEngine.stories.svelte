<script module lang="ts">
  import { InformationIcon } from "@canonical/svelte-icons";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Attachment } from "svelte/attachments";
  import Component from "./TooltipEngine.svelte";

  const { Story } = defineMeta({
    title: "Components/Tooltip/TooltipEngine",
    tags: ["autodocs"],
    component: Component,
    args: {
      preferredDirections: ["top"],
    },
    parameters: {
      controls: {
        include: [
          "preferredDirections",
          "autoFit",
          "closeOnEscape",
          "activateDelay",
          "deactivateDelay",
          "distance",
          "zIndex",
          "maxWidth",
        ],
      },
    },
    argTypes: {
      children: {
        control: false,
      },
      message: {
        control: false,
      },
      icon: {
        control: false,
      },
    },
  });
</script>

<script lang="ts">
  import Button from "../Button/Button.svelte";

  const scrollToCenter: Attachment<HTMLElement> = (el) =>
    el.scrollTo({
      top: el.clientHeight / 2,
      left: el.clientWidth / 2,
      behavior: "instant",
    });
</script>

<Story name="Default">
  {#snippet template({ children: _, message: __, ...args })}
    <div style="height: 100vh; display: grid; place-items: center;">
      <Component {...args}>
        {#snippet children(triggerProps)}
          <Button {...triggerProps}>Hover or focus me</Button>
        {/snippet}
        {#snippet message()}
          Hello there!
        {/snippet}
      </Component>
    </div>
  {/snippet}
</Story>

<Story name="With icon">
  {#snippet template({ children: _, message: __, icon: ___,...args })}
    <div style="height: 100vh; display: grid; place-items: center;">
      <Component {...args}>
        {#snippet icon()}
          <InformationIcon />
        {/snippet}
        {#snippet children(triggerProps)}
          <Button {...triggerProps}>Hover or focus me</Button>
        {/snippet}
        {#snippet message()}
          Hello there!
        {/snippet}
      </Component>
    </div>
  {/snippet}
</Story>

<Story name="Multiline">
  {#snippet template({ children: _, message: __, icon: ___,...args })}
    <div style="height: 100vh; display: grid; place-items: center;">
      <Component {...args}>
        {#snippet icon()}
          <InformationIcon />
        {/snippet}
        {#snippet children(triggerProps)}
          <Button {...triggerProps}>Hover or focus me</Button>
        {/snippet}
        {#snippet message()}
          The standard tooltip explains an icon or control, or adds a short clarification that runs across several lines when the content is long.
        {/snippet}
      </Component>
    </div>
  {/snippet}
</Story>

<Story
  name="With different positions"
   argTypes={{ preferredDirections: { control: false } }}
 
>
  {#snippet template({ children: _, message: __, preferredDirections:___, ...args })}
    <div
      style="padding: 4rem; display: grid; grid-template-columns: repeat(2, 1fr); row-gap: 4rem; place-items: center;"
    >
      {#each ["top", "bottom", "top-start", "top-end", "bottom-start", "bottom-end", "left", "right"] as const as position (position)}
        <Component preferredDirections={[position]} {...args}>
      {#snippet children(triggerProps)}
        <Button {...triggerProps}>{position}</Button>
      {/snippet}
      {#snippet message()}
        Hello there!
      {/snippet}
    </Component>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="With auto fit"
  args={{
    preferredDirections: ["bottom-end"],
    autoFit: true,
  }}
>
  {#snippet template({ children: _, message: __, ...args })}
    <div
      class="placeholder-box"
      style="height: 250px; overflow: auto;"
      {@attach scrollToCenter}
    >
      <div
        style="height: 200%; width: 200%; display: grid; place-items: center; position: relative;"
      >
          <Component {...args}>
      {#snippet children(triggerProps)}
        <Button {...triggerProps}>Click me</Button>
      {/snippet}
         {#snippet message()}
        And now scroll the container
      {/snippet}
    </Component>
      </div>
    </div>
  {/snippet}
</Story>