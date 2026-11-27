<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../../../storybook/decorators.js";
  import Component from "./Option.svelte";

  const { Story } = defineMeta({
    title: "components/ChoicesField/Option",
    component: Component,
    decorators: [decorators.optionGroup("ds form-choices inline")],
  });

  const defaultArgs = {
    name: "choices",
    type: "radio",
    option: { value: "a", label: "Option A" },
    checked: false,
    disabled: false,
  } as const;
</script>

<Story name="Default" args={defaultArgs} />

<Story name="Checked" args={{ ...defaultArgs, checked: true }} />

<Story name="Disabled" args={{ ...defaultArgs, disabled: true }} />
