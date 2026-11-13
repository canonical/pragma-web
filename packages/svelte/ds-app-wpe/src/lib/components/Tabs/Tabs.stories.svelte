<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tabs from "./Tabs.svelte";

  const navigationRoot = {
    key: "directory",
    items: [
      { url: "#people", label: "People" },
      { url: "#teams", label: "Teams" },
      { url: "#locations", label: "Locations" },
    ],
  };

  const { Story } = defineMeta({
    title: "Components/Tabs",
    component: Tabs,
    tags: ["autodocs"],
    args: {
      "aria-label": "Directory sections",
      navigationRoot,
      currentUrl: "#people",
      onclick(event) {
        if (event.target instanceof Element) {
          event.target.closest("a")?.setAttribute("target", "_self");
        }
      },
    },
    parameters: {
      docs: {
        description: {
          component:
            "Navigation between related sections using native links. The consumer supplies the current URL; Tabs does not own selection or render tab panels.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { onMount } from "svelte";

  let currentUrl = $state("#people");

  function syncLocation(): void {
    currentUrl = window.location.hash || "#people";
  }

  onMount(syncLocation);
</script>

<svelte:window onhashchange={syncLocation} />

<Story name="Default" />

<Story name="Second section active" args={{ currentUrl: "#teams" }} />

<Story
  name="Inert and disabled items"
  args={{
    navigationRoot: {
      key: "directory",
      items: [
        ...navigationRoot.items,
        { key: "soon", label: "Coming soon" },
        { url: "#archived", label: "Archived", disabled: true },
      ],
    },
  }}
/>

<Story name="Live navigation">
  {#snippet template(args)}
    <Tabs {...args} {currentUrl} />
  {/snippet}
</Story>

<Story name="Overflow">
  {#snippet template(args)}
    <div style="max-inline-size: 20rem;">
      <Tabs
        {...args}
        navigationRoot={{
          key: "directory",
          items: [
            ...navigationRoot.items,
            { url: "#departments", label: "Departments" },
            { url: "#projects", label: "Projects" },
            { url: "#events", label: "Events" },
          ],
        }}
      />
    </div>
  {/snippet}
</Story>
