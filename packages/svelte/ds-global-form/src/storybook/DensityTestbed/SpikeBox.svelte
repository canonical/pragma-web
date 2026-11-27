<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    children,
    as = "div",
    role,
  }: {
    children: Snippet;
    as?: "div" | "button";
    role?: string;
  } = $props();
</script>

<svelte:element this={as} class="spike-box" {role} type={as === "button" ? "button" : undefined}><span class="seat p">{@render children()}</span></svelte:element>

<!-- @component
Baseline-alignment spike — boxed-control primitive (WORK IN PROGRESS).

The unit under test: a bordered box whose interior is a single line of
`.p`-tier text (a stand-in for a button label, input value, nav-item text or
table-cell text). Its seat uses the shipped engine model (the asymmetric
start/end nudges from `density.testbed.css`); the alternative external-margin
model was dropped, so there is no model toggle. Using one primitive keeps
buckets comparing like-for-like; the real button and inputs are shown
alongside in the story for reference.
-->
