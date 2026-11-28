<script lang="ts">
  import type { Snippet } from "svelte";
  import type { EventProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds timeline-event";

  const {
    actor,
    datetime,
    children,
    criticality,
    class: className,
    ...rest
  }: EventProps = $props();
</script>

{#snippet text(content: Snippet | string)}
  {#if typeof content === "string"}
    {content}
  {:else}
    {@render content()}
  {/if}
{/snippet}

<!-- Siblings are written without whitespace between them, so the markup
matches React's: no whitespace text nodes between the event's parts. -->
<div class={[componentCssClassName, criticality, className]} {...rest}
  ><div class="marker" aria-hidden="true"></div><div class="content"
    >{#if actor}<div class="actor">{@render text(actor)}</div>{/if}{#if datetime}<time
        class="datetime">{@render text(datetime)}</time
      >{/if}<div class="payload">{@render children()}</div></div
  ></div>

<!-- @component
Timeline.Event subcomponent

A single event in the timeline, with optional actor and datetime, rendered in
that order before the payload.

@implements ds:global.subcomponent.timeline-event
-->
