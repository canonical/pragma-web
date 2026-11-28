<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Spinner from "./Spinner.svelte";

  /**
   * An indeterminate activity indicator: the `spinner` icon rotating
   * continuously.
   */
  const { Story } = defineMeta({
    title: "Subcomponents/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "An indeterminate activity indicator: the `spinner` icon rotating continuously. It is decorative by default (`aria-hidden`); pass an `aria-label` when the spinner is the only signal that work is in progress, so it is announced as a named image. Inside a control that already announces its busy state (e.g. a submitting Button), leave it decorative.",
        },
      },
    },
  });
</script>

<!--
  The default spinner. It is decorative unless labelled — set `aria-label`
  (shown here) to expose it as a named image for standalone loading states.
-->
<Story name="Default" args={{ "aria-label": "Loading" }} />

<!--
  The spinner's size is consumed from the text: it tracks the `font-size` of
  its container, so it lines up with adjacent text at any scale. (Override
  `--spinner-size`, or `--icon-size` globally, only when you need a size that
  is decoupled from the text.)
-->
<Story name="Sized">
  {#snippet template(args)}
    <div style="display: flex; align-items: center; gap: 1rem;">
      <span style="font-size: 1rem;"><Spinner {...args} /></span>
      <span style="font-size: 2rem;"><Spinner {...args} /></span>
      <span style="font-size: 3rem;"><Spinner {...args} /></span>
    </div>
  {/snippet}
</Story>
