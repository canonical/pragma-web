<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import type { ButtonProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds button";

  let {
    class: className,
    children,
    importance = "primary",
    anticipation,
    emphasis,
    nested,
    icon,
    loading,
    loadingLabel = "Loading",
    disabled,
    onclick,
    ...rest
  }: ButtonProps = $props();

  // A loading button stays focusable (a natively disabled button would drop
  // keyboard focus to the document) and is instead marked aria-disabled, with
  // activation blocked here.
  const isBlocked = $derived(loading === true && !disabled);

  // The status region is rendered whenever the consumer controls `loading`,
  // so it exists before its text changes; live regions inserted together with
  // their content are not reliably announced.
  const hasLoadingStatus = $derived(loading !== undefined);

  $effect(() => {
    if (
      import.meta.env.DEV &&
      (icon || loading) &&
      !children &&
      !rest["aria-label"] &&
      !rest["aria-labelledby"]
    ) {
      console.warn(
        "Button: icon-only buttons need an explicit `aria-label` or `aria-labelledby` to be accessible.",
      );
    }
  });

  // Blocks activation while loading: preventDefault stops a form submission
  // and stopImmediatePropagation stops listeners attached after this one.
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    onclick?.(event);
  };
</script>

<!--
  The icon and label stay in the DOM while loading to avoid layout shifts.
-->
<button
  class={[
    componentCssClassName,
    importance,
    anticipation,
    emphasis,
    nested && "nested dense",
    loading && "loading",
    className,
  ]}
  aria-busy={loading || undefined}
  aria-disabled={isBlocked || undefined}
  {disabled}
  {...rest}
  onclick={handleClick}
>
  <!--
    # TODO: Update Icon to use Svelte Icon
    # currently blocked by: https://warthogs.atlassian.net/browse/WPE-430
    # and https://github.com/canonical/pragma-web/pull/959
  -->
  {#if icon}
    <span class="icon">
      {@render icon()}
    </span>
  {/if}
  {#if children}
    <span class="label">
      {@render children()}
    </span>
  {/if}
  {#if loading}
    <span class="loading-spinner" aria-hidden="true">
      <!-- TODO: replace with the shared Spinner once an Icon component exists. -->
      <svg
        class="spinner"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path
          d="M7.99995 13.5C8.79532 13.5008 9.58136 13.3287 10.3036 12.9956C11.0259 12.6625 11.6671 12.1764 12.1829 11.571L13.4999 12.331C12.8454 13.1636 12.0101 13.8365 11.0573 14.2989C10.1045 14.7612 9.05903 15.001 7.99995 15C6.94086 15.001 5.89541 14.7612 4.94259 14.2989C3.98978 13.8365 3.15452 13.1636 2.49995 12.331L3.81595 11.571C4.33186 12.1766 4.97326 12.6627 5.69572 12.9958C6.41817 13.3289 7.2044 13.5009 7.99995 13.5ZM6.99895 1.071V2.591C6.21661 2.73584 5.475 3.04862 4.82524 3.50779C4.17549 3.96696 3.63304 4.56158 3.23532 5.25066C2.83759 5.93975 2.59404 6.70689 2.52147 7.4992C2.4489 8.29151 2.54902 9.09013 2.81495 9.84L1.49995 10.6C1.11442 9.63525 0.948404 8.59679 1.01395 7.55993C1.07949 6.52307 1.37495 5.51378 1.8789 4.60526C2.38285 3.69674 3.08266 2.91174 3.92759 2.30719C4.77251 1.70265 5.74138 1.2937 6.76395 1.11L6.99895 1.072V1.071ZM14.9999 8C14.9999 8.918 14.8229 9.795 14.5019 10.6L13.1849 9.839C13.4509 9.08906 13.551 8.29036 13.4783 7.498C13.4057 6.70563 13.1621 5.93844 12.7642 5.24934C12.3664 4.56025 11.8238 3.96564 11.174 3.50652C10.5241 3.04741 9.78237 2.73471 8.99995 2.59V1.07C12.3919 1.555 14.9999 4.474 14.9999 8Z"
        />
      </svg>
    </span>
  {/if}
</button>
<!--
  The status region sits outside the button: a button's descendants are
  presentational, so a live region inside it is not reliably announced.
-->
{#if hasLoadingStatus}
  <span class="ds button-loading-status" role="status">
    {loading ? loadingLabel : ""}
  </span>
{/if}

<!-- @component
Buttons trigger actions within an interface, typically involving data
transformation or manipulation. They provide clear visual indicators of
the primary actions users can perform on a page or section.

`import { Button } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Button importance="primary" anticipation="constructive">
  Save changes
</Button>
```

@implements ds:global.component.button
-->
