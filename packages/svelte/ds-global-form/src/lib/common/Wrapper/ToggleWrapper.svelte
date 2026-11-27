<script lang="ts">
  import {
    Description,
    Error as FieldError,
    Label,
  } from "../../subcomponent/Field/index.js";
  import type { ToggleWrapperProps } from "../types.js";
  import useConditionalDisplay from "../useConditionalDisplay.svelte.js";
  import useNativeValidity from "../useNativeValidity.svelte.js";
  import createControlProps from "./createControlProps.js";
  import "./styles.css";
  import "./ToggleWrapper.css";

  const componentCssClassName = "ds field field-toggle";

  let {
    id,
    class: className,
    style,
    name,
    label,
    controlLabel,
    labelPosition = "after",
    description,
    error,
    isOptional = false,
    requiredIndicator,
    condition,
    onhide,
    children,
  }: ToggleWrapperProps = $props();

  const uid = $props.id();
  const baseId = $derived(`${uid}-${name}`);
  // Without an `error`, the field shows its control's native validation
  // message once the control was invalid.
  const nativeValidity = useNativeValidity();
  const shownError = $derived(error ?? nativeValidity.message);
  const isError = $derived(Boolean(shownError));
  // Toggle controls are not natively required: the label marker and
  // `aria-required` convey the field's optionality.
  const controlProps = $derived({
    ...createControlProps(baseId, isError, !isOptional, Boolean(description)),
    required: false,
  });
  // The inline label always carries the `for` binding; the heading only
  // appears when a distinct `controlLabel` was supplied.
  const inlineLabel = $derived(controlLabel ?? label);
  const headingLabel = $derived(controlLabel && label ? label : undefined);
  const display = useConditionalDisplay(
    () => condition,
    () => onhide,
  );
</script>

{#if display.isVisible}<div {id} {style} class={[componentCssClassName, className, isError && "danger"]} {@attach nativeValidity.follow}>{#if headingLabel}<Label {name} tag="span" class="field-toggle-heading">{headingLabel}</Label>{/if}<!-- DOM order stays control-then-label; `labelPosition: "before"` moves
         the label visually through CSS, keeping the accessible order stable. --><div class={["field-toggle-control", `label-${labelPosition}`]}
      >{@render children(controlProps)}<Label
        {name}
        {isOptional}
        {requiredIndicator}
        id={`${baseId}-label`}
        for={baseId}
      >{inlineLabel || name}</Label
    ></div
    >{#if description}<Description id={`${baseId}-description`}>{description}</Description
    >{/if}{#if isError}<FieldError id={`${baseId}-error`}>{shownError}</FieldError
    >{/if}</div
>{/if}

<!-- @component
Field chrome for toggle inputs (checkbox, switch), where the control sits
inline beside its label. `controlLabel` is the inline label; `label` becomes a
heading above it only when both are set.
-->
