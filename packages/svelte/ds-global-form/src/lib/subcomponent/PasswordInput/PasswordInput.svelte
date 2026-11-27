<script lang="ts">
  import type { PasswordInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input password chrome";

  let {
    id,
    class: className,
    style,
    revealable = true,
    revealLabel = "Show password",
    maskLabel = "Hide password",
    disabled,
    value = $bindable(),
    ...rest
  }: PasswordInputProps = $props();

  const fallbackId = $props.id();
  const resolvedId = $derived(id ?? fallbackId);
  let revealed = $state(false);
</script>

<div {style} class={[componentCssClassName, className]}><input
    id={resolvedId}
    class="p"
    type={revealed ? "text" : "password"}
    {disabled}
    bind:value
    {...rest}
  />{#if revealable}<!-- Matches the input's disabled state, so the toggle is not interactive
         on an otherwise disabled field. --><button
      type="button"
      class="suffix reveal-toggle"
      aria-label={revealed ? maskLabel : revealLabel}
      aria-controls={resolvedId}
      aria-pressed={revealed}
      {disabled}
      onclick={() => (revealed = !revealed)}
    ><span class="reveal-icon" data-state={revealed ? "revealed" : "masked"}></span></button>{/if}</div>

<!-- @component
Presentational password input, masked by default, with a reveal/mask toggle in
the suffix position. Bind `value` for two-way binding.

`import { PasswordInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.password_input
-->
