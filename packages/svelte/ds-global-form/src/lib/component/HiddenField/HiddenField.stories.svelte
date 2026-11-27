<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./HiddenField.svelte";

  const { Story } = defineMeta({
    title: "components/HiddenField",
    component: Component,
    decorators: [decorators.form()],
    parameters: { chromatic: { disableSnapshot: true } },
    args: { value: "hidden_value" },
  });
</script>

<Story name="Default" args={{ name: "hidden_field" }} />
