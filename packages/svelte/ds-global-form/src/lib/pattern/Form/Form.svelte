<script lang="ts" generics="Values extends FormValues = FormValues">
  import { setFormOwnerContext } from "../../utils/owner/formOwnerContext.js";
  import type { FormValues } from "../../utils/owner/types.js";
  import type { FormProps } from "./types.js";

  const componentCssClassName = "ds form";

  let {
    class: className,
    owner,
    onsubmit,
    onsubmitcapture,
    children,
    ...rest
  }: FormProps<Values> = $props();

  setFormOwnerContext(() => owner as FormProps["owner"]);

  /**
   * Lets the owner see the submit first, in the capture phase, so it runs
   * before listeners such as SvelteKit's `enhance`. A submit the owner stops
   * reaches `onsubmit` but no later listener.
   */
  const submit = (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    onsubmitcapture?.(event);
    const wasPrevented = event.defaultPrevented;
    owner?.submit?.(event);
    const isStopped = !wasPrevented && event.defaultPrevented;
    onsubmit?.(event);
    if (isStopped) event.stopImmediatePropagation();
  };
</script>

<form class={[componentCssClassName, "subgrid", className]} {...rest} onsubmitcapture={submit}>{@render children?.()}</form>

<!-- @component
A form laid out as a subgrid of its parent grid, so its fields align on the
shared columns. With an `owner`, every `Field` inside reads and writes its
value, error and blur through the owner by `name`, and the owner sees each
submit before `onsubmit` does; an explicit `bind:value` or `error` on a field
wins. Without one, the form is native: fields hold their own values and the
browser posts them. Native form attributes, handlers and attachments (for
example SvelteKit's `enhance` through `fromAction`) are passed through to the
`<form>`.

`import { Form } from "@canonical/svelte-ds-global-form";`

@implements ds:global.pattern.form
-->
