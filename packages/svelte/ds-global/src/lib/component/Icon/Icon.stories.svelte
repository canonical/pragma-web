<script lang="ts" module>
  import { ICON_NAMES } from "@canonical/ds-assets";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Icon from "./Icon.svelte";

  /**
   * Icons are visual symbols that represent actions, objects, or concepts.
   */
  const { Story } = defineMeta({
    title: "Components/Icon",
    component: Icon,
    tags: ["autodocs"],
    argTypes: {
      icon: {
        options: ICON_NAMES,
        control: { type: "select" },
        description: "The name of the icon to display.",
      },
    },
    parameters: {
      docs: {
        description: {
          component:
            "Icons are visual symbols that represent actions, objects, or concepts.",
        },
      },
    },
  });
</script>

<Story name="Default" args={{ icon: "user" }} />

<Story
  name="Size"
  args={{ icon: "link" }}
  parameters={{
    docs: {
      description: {
        story: "Icons are sized relative to the `font-size` of their container.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div>
      <h1>Button&nbsp;<Icon {...args} /></h1>
      <h2>Variants&nbsp;<Icon {...args} /></h2>
      <h3>Positive&nbsp;<Icon {...args} /></h3>
      <h4>Usage&nbsp;<Icon {...args} /></h4>
      <h5>When to use&nbsp;<Icon {...args} /></h5>
      <h6>
        To indicate a positive and/or prominent action&nbsp;<Icon {...args} />
      </h6>
    </div>
  {/snippet}
</Story>

<Story
  name="Color"
  args={{ icon: "user" }}
  parameters={{
    docs: {
      description: {
        story:
          "Icons inherit the color of their parent element. Set `color` on a parent element to change the icon color.",
      },
    },
  }}
>
  {#snippet template(args)}
    <div>
      <p style="color: blue;">Blue<Icon {...args} /></p>
      <p style="color: red;">Red<Icon {...args} /></p>
      <p style="color: green;">Green<Icon {...args} /></p>
    </div>
  {/snippet}
</Story>
