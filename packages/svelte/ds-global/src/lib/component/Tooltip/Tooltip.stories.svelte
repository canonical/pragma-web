<script module lang="ts">
  import { InformationIcon } from "@canonical/svelte-icons";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Tooltip.svelte";

  const { Story } = defineMeta({
    title: "Components/Tooltip",
    tags: ["autodocs"],
    component: Component,
    args: { arrow: "down", isOpen: true },
    argTypes: {
      children: {
        control: false,
      },
      icon: {
        control: false,
      },
    },
  });
</script>

<Story name="Default" >
  {#snippet template({ children: _,  ...rest })}
    <Component {...rest}>
      Lorem ipsum dolor sit amet
    </Component>
  {/snippet}
</Story>

<Story name="With Icon">
  {#snippet template({ children: _, icon: __, ...rest })}
    <Component {...rest}>
     {#snippet icon()}
          <InformationIcon />
        {/snippet}
      Lorem ipsum dolor sit amet
    </Component>
  {/snippet}
</Story>

<Story name="Multiline">
  {#snippet template({ children: _, icon: __, ...rest })}
    <Component {...rest}>
     {#snippet icon()}
          <InformationIcon />
        {/snippet}
      The standard tooltip explains an icon or control, or adds a short clarification that runs across several lines when the content is long.
    </Component>
  {/snippet}
</Story>
