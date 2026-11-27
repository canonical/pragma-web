<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import { TextareaInput } from "../../subcomponent/TextareaInput/index.js";
  import { TextInput } from "../../subcomponent/TextInput/index.js";
  import Component from "./Wrapper.svelte";

  // The Wrapper renders its control through the `children` snippet, which
  // receives the control's ID and accessibility wiring.
  const { Story } = defineMeta({
    title: "common/Wrapper",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "email" }}>
  {#snippet template(args)}
    <Component {...args} name={args.name ?? "email"}>
      {#snippet children(controlProps)}
        <TextInput name={args.name ?? "email"} {...controlProps} />
      {/snippet}
    </Component>
  {/snippet}
</Story>

<Story name="Textarea" args={{ name: "description" }}>
  {#snippet template(args)}
    <Component {...args} name={args.name ?? "description"}>
      {#snippet children(controlProps)}
        <TextareaInput name={args.name ?? "description"} {...controlProps} />
      {/snippet}
    </Component>
  {/snippet}
</Story>
