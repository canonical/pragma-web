<script lang="ts">
  import {
    Description,
    Error as FieldError,
    Label,
  } from "../../subcomponent/Field/index.js";
  import type { WrapperProps } from "../types.js";
  import useConditionalDisplay from "../useConditionalDisplay.svelte.js";
  import createControlProps from "./createControlProps.js";
  import "./styles.css";

  const componentCssClassName = "ds field";

  let {
    id,
    class: className,
    style,
    name,
    label,
    description,
    error,
    isOptional = false,
    requiredIndicator,
    descriptionPosition = "leading",
    mockLabel = false,
    condition,
    onhide,
    children,
  }: WrapperProps = $props();

  const uid = $props.id();
  const baseId = $derived(`${uid}-${name}`);
  const isError = $derived(Boolean(error));
  const controlProps = $derived(
    createControlProps(baseId, isError, !isOptional, Boolean(description)),
  );
  const display = useConditionalDisplay(
    () => condition,
    () => onhide,
  );
</script>

{#if display.isVisible}<div {id} {style} class={[componentCssClassName, className, isError && "danger"]}><Label
      {name}
      {isOptional}
      {requiredIndicator}
      tag={mockLabel ? "span" : undefined}
      id={`${baseId}-label`}
      for={baseId}
    >{label || name}</Label
    ><div class="payload"
      >{#if descriptionPosition === "leading" && description}<Description id={`${baseId}-description`}>{description}</Description
      >{/if}{@render children(controlProps)}{#if descriptionPosition === "trailing" && description}<Description id={`${baseId}-description`}>{description}</Description
      >{/if}{#if isError}<FieldError id={`${baseId}-error`}>{error}</FieldError
      >{/if}</div
  ></div
>{/if}

<!-- @component
The stacked field chrome: label, then a payload of description, control and
error. The control is rendered by the `children` snippet, which receives its
ID and accessibility wiring.
-->
