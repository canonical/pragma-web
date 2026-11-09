<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Avatar.svelte";

  const src = "https://assets.ubuntu.com/v1/fca94c45-snap+icon.png";

  const { Story } = defineMeta({
    title: "components/Avatar",
    tags: ["autodocs"],
    component: Component,
    args: { size: "small" },
  });
</script>

<Story name="Default" args={{ name: "John Doe", src }} />

<Story
  name="Sizes"
  args={{ name: "John Doe" }}
  argTypes={{ size: { table: { disable: true } } }}
>
  {#snippet template(args)}
    <div class="row">
      {#each ["small", "large"] as const as size (size)}
        <Component {...args} {size} />
      {/each}
    </div>
    <br />
    <div class="row">
      {#each ["small", "large"] as const as size (size)}
        <Component {...args} {size} name={undefined} />
      {/each}
    </div>
  {/snippet}
</Story>

<Story name="Without user data" />

<Story
  name="Without avatar URL"
  args={{
    name: "Jane Doe",
  }}
/>

<Story
  name="With image attributes"
  args={{
    name: "John Doe",
    src,
    imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
  }}
/>

<Story
  name="When avatar fails to load"
  args={{
    name: "That's Not An Image",
    src: "invalid-url",
  }}
/>

<Story
  name="When avatar fails to load and no name is provided"
  args={{
    src: "invalid-url",
  }}
/>

<Story
  name="With a very long name"
  tags={["!autodocs"]}
  args={{
    name: "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit",
  }}
/>

<!-- Simulate no JavaScript environment by overriding the onerror handler -->

<Story
  name="When avatar fails to load (no JavaScript)"
  tags={["!autodocs"]}
  args={{
    src: "invalid-url",
    name: "John Doe",
    onerror: () => {},
  }}
/>

<Story
  name="When avatar fails to load and no name is provided (no JavaScript)"
  tags={["!autodocs"]}
  args={{
    src: "invalid-url",
    onerror: () => {},
  }}
/>

<Story
  name="Surface elevation"
  tags={["!autodocs"]}
  args={{ name: "John Doe" }}
>
  {#snippet template(args)}
    <div class="stack">
      <div class="box dashed">
        <code>no .surface</code>
        <Component {...args} />
      </div>

      <div class="surface box">
        <code>.surface</code>
        <Component {...args} />

        <div class="surface box">
          <code>.surface .surface</code>
          <Component {...args} />

          <div class="surface box">
            <code>.surface .surface .surface</code>
            <Component {...args} />
          </div>
        </div>
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 34rem;
  }

  .box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    background-color: var(--surface-color-background);
  }

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .dashed {
    border-style: dashed;
    background-color: transparent;
  }
</style>
