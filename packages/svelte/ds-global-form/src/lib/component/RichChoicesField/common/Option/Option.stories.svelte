<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../../../storybook/decorators.js";
  import Component from "./Option.svelte";

  const { Story } = defineMeta({
    title: "components/RichChoicesField/Option",
    component: Component,
    decorators: [decorators.optionGroup("ds form-rich-choices")],
  });

  const defaultArgs = {
    name: "rich-choices",
    type: "radio",
    option: { value: "a", label: "Option A" },
    checked: false,
    disabled: false,
  } as const;
</script>

<Story name="Default" args={defaultArgs} />

<Story name="Checked" args={{ ...defaultArgs, checked: true }} />

<Story name="Disabled" args={{ ...defaultArgs, disabled: true }} />
