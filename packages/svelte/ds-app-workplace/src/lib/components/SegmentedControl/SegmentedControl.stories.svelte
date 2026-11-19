<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import SegmentedControl from "./SegmentedControl.svelte";

  const directoryItems = [
    { label: "My direct reports", value: "direct" },
    { label: "My span of control", value: "span" },
  ];

  const { Story } = defineMeta({
    title: "Components/SegmentedControl",
    component: SegmentedControl,
    tags: ["autodocs"],
    args: {
      "aria-label": "Directory scope",
      items: directoryItems,
      value: "direct",
      onValueChange: fn(),
    },
    parameters: {
      layout: "centered",
      docs: {
        description: {
          component:
            "A compact group of mutually exclusive tabs used to switch between views of the same content.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let panelValue = $state("direct");
</script>

<Story name="Default" />

<Story name="Second item selected" args={{ value: "span" }} />

<Story
  name="With tab panels"
  args={{
    items: [
      {
        label: "My direct reports",
        value: "direct",
        id: "direct-reports-tab",
        ariaControls: "direct-reports-panel",
      },
      {
        label: "My span of control",
        value: "span",
        id: "span-of-control-tab",
        ariaControls: "span-of-control-panel",
      },
    ],
  }}
>
  {#snippet template(args)}
    <div>
      <SegmentedControl {...args} bind:value={panelValue} />
      <div
        id="direct-reports-panel"
        role="tabpanel"
        aria-labelledby="direct-reports-tab"
        tabindex="0"
        hidden={panelValue !== "direct"}
      >
        <h2>Direct reports</h2>
        <ul>
          <li>Amelia Jones</li>
          <li>Noah Smith</li>
        </ul>
      </div>
      <div
        id="span-of-control-panel"
        role="tabpanel"
        aria-labelledby="span-of-control-tab"
        tabindex="0"
        hidden={panelValue !== "span"}
      >
        <h2>Span of control</h2>
        <ul>
          <li>Amelia Jones</li>
          <li>Noah Smith</li>
          <li>Oliver Brown</li>
        </ul>
      </div>
    </div>
  {/snippet}
</Story>


<Story
  name="Disabled item"
  args={{
    items: [
      ...directoryItems,
      { label: "All reports", value: "all", disabled: true },
    ],
  }}
/>
