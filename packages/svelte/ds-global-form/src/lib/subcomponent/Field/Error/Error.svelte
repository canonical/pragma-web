<script lang="ts">
  import type { ErrorProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds field-error";

  let { id, class: className, style, children }: ErrorProps = $props();
</script>

<!-- The icon is decorative: the alert role already announces the message. --><p {id} {style} class={[componentCssClassName, className]} role="alert"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="ds icon" aria-hidden="true"><use href="/icons/error.svg#error"></use></svg>{@render children?.()}</p>

<!-- @component
The validation message of a form field, announced as an alert.

@implements ds:global.subcomponent.field-error
-->
