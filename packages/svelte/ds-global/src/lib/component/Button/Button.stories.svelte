<script lang="ts" module>
  import { MODIFIER_FAMILIES } from "@canonical/ds-types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import Surface from "../../../storybook/Surface.svelte";
  import Button from "./Button.svelte";

  const matrixCols = `auto repeat(${MODIFIER_FAMILIES.anticipation.length + 1}, auto)`;

  // Svelte 5 Storybook autodocs do not currently pick up component docs from
  // the component source reliably, so we inject the description here instead:
  // https://github.com/storybookjs/storybook/discussions/34104#discussioncomment-16084065

  /**
   * Buttons trigger actions within an interface, typically involving data
   * transformation or manipulation. They provide clear visual indicators of
   * the primary actions users can perform on a page or section.
   */
  const { Story } = defineMeta({
    title: "Components/Button",
    component: Button,
    tags: ["autodocs"],
    decorators: [() => ({ Component: Surface })],
    argTypes: {
      // Importance is never blank — primary is the default hierarchy.
      importance: {
        control: "select",
        options: [...MODIFIER_FAMILIES.importance],
      },
      anticipation: {
        control: "select",
        options: [undefined, ...MODIFIER_FAMILIES.anticipation],
      },
      emphasis: {
        control: "select",
        options: [undefined, "branded"],
      },
      variant: {
        control: "select",
        options: [undefined, "link"],
      },
    },
    args: { onclick: fn(), importance: "primary" },
  });

  // Controls for props a story hardcodes would have no effect, so they are
  // disabled in those stories.
  const matrixArgTypes = {
    importance: { control: false },
    anticipation: { control: false },
  } as const;
  const disabledMatrixArgTypes = {
    ...matrixArgTypes,
    disabled: { control: false },
  } as const;
</script>

<Story name="Default">
  {#snippet template(args)}
    <Button {...args}>Button</Button>
  {/snippet}
</Story>

<!--
  The full variant matrix: each importance (rows) combined with the neutral
  base and every anticipation (columns). The two compose orthogonally.
-->

<Story
  name="Matrix"
  argTypes={matrixArgTypes}
>
  {#snippet template(args)}
    <div
      style="display: grid; grid-template-columns: {matrixCols}; gap: 0.75rem 1rem; align-items: center; justify-items: start;"
    >
      <span></span>
      <span style="font-size: 0.75rem; opacity: 0.6;">neutral</span>
      {#each MODIFIER_FAMILIES.anticipation as a (a)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{a}</span>
      {/each}
      {#each MODIFIER_FAMILIES.importance as importance (importance)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{importance}</span>
        <Button {...args} {importance}>Button</Button>
        {#each MODIFIER_FAMILIES.anticipation as anticipation (anticipation)}
          <Button {...args} {importance} {anticipation}>Button</Button>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  The same matrix in the disabled state — every importance × anticipation
  combination rendered `disabled`.
-->

<Story
  name="DisabledMatrix"
  argTypes={disabledMatrixArgTypes}
>
  {#snippet template(args)}
    <div
      style="display: grid; grid-template-columns: {matrixCols}; gap: 0.75rem 1rem; align-items: center; justify-items: start;"
    >
      <span></span>
      <span style="font-size: 0.75rem; opacity: 0.6;">neutral</span>
      {#each MODIFIER_FAMILIES.anticipation as a (a)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{a}</span>
      {/each}
      {#each MODIFIER_FAMILIES.importance as importance (importance)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{importance}</span>
        <Button {...args} {importance} disabled>Button</Button>
        {#each MODIFIER_FAMILIES.anticipation as anticipation (anticipation)}
          <Button {...args} {importance} {anticipation} disabled>Button</Button>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  Every importance level has a brand version, for actions and calls to action
  in an editorial setting such as the sites or documentation tiers. Each row
  shows one importance, enabled and disabled.
-->

<Story
  name="Branded"
  argTypes={{ importance: { control: false }, emphasis: { control: false }, disabled: { control: false } }}
>
  {#snippet template(args)}
    <div
      style="display: grid; grid-template-columns: auto auto auto; gap: 0.75rem 1rem; align-items: center; justify-items: start;"
    >
      <span></span>
      <span style="font-size: 0.75rem; opacity: 0.6;">enabled</span>
      <span style="font-size: 0.75rem; opacity: 0.6;">disabled</span>
      {#each MODIFIER_FAMILIES.importance as importance (importance)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{importance}</span>
        <Button {...args} {importance} emphasis="branded">Get started</Button>
        <Button {...args} {importance} emphasis="branded" disabled>Get started</Button>
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  Link variant renders as inline text with underline.
-->

<Story
  name="LinkVariant"
  args={{ variant: "link" }}
>
  {#snippet template(args)}
    <Button {...args}>Learn more</Button>
  {/snippet}
</Story>

<!--
  The full matrix with a leading icon in every cell — so the icon colour can
  be checked against each importance × anticipation combination.
-->

<Story
  name="IconMatrix"
  argTypes={matrixArgTypes}
>
  {#snippet template(args)}
    {#snippet editIcon()}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        aria-hidden="true"
      ><use href="/icons/edit.svg#edit" /></svg>
    {/snippet}
    <div
      style="display: grid; grid-template-columns: {matrixCols}; gap: 0.75rem 1rem; align-items: center; justify-items: start;"
    >
      <span></span>
      <span style="font-size: 0.75rem; opacity: 0.6;">neutral</span>
      {#each MODIFIER_FAMILIES.anticipation as a (a)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{a}</span>
      {/each}
      {#each MODIFIER_FAMILIES.importance as importance (importance)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{importance}</span>
        <Button {...args} {importance} icon={editIcon}>Button</Button>
        {#each MODIFIER_FAMILIES.anticipation as anticipation (anticipation)}
          <Button {...args} {importance} {anticipation} icon={editIcon}>Button</Button>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  The icon matrix in the disabled state — the icon should dim with the label
  across every combination.
-->

<Story
  name="DisabledIconMatrix"
  argTypes={disabledMatrixArgTypes}
>
  {#snippet template(args)}
    {#snippet editIcon()}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        aria-hidden="true"
      ><use href="/icons/edit.svg#edit" /></svg>
    {/snippet}
    <div
      style="display: grid; grid-template-columns: {matrixCols}; gap: 0.75rem 1rem; align-items: center; justify-items: start;"
    >
      <span></span>
      <span style="font-size: 0.75rem; opacity: 0.6;">neutral</span>
      {#each MODIFIER_FAMILIES.anticipation as a (a)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{a}</span>
      {/each}
      {#each MODIFIER_FAMILIES.importance as importance (importance)}
        <span style="font-size: 0.75rem; opacity: 0.6;">{importance}</span>
        <Button {...args} {importance} icon={editIcon} disabled>Button</Button>
        {#each MODIFIER_FAMILIES.anticipation as anticipation (anticipation)}
          <Button {...args} {importance} {anticipation} icon={editIcon} disabled>Button</Button>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<!--
  A loading button shows a Spinner, is marked `aria-busy` and `aria-disabled`,
  and blocks activation so the action cannot be triggered again while it is in
  flight. It stays focusable, and a visually hidden status region announces
  `loadingLabel`.
-->

<Story
  name="Loading"
  argTypes={{ loading: { control: false } }}
>
  {#snippet template(args)}
    <Button {...args} loading>Saving</Button>
  {/snippet}
</Story>
