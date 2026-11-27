<script lang="ts">
  let { data }: { data: Record<string, unknown> | null } = $props();
</script>

{#if data}<pre
    style="margin-block-start: 1rem; padding: 0.75rem; background: var(--color-background-neutral-subtle, #f4f4f4); border-radius: 0.25rem; font-size: 0.85em; overflow-x: auto;">Submitted: {JSON.stringify(data, null, 2)}</pre>{/if}

<!-- @component
A small readout so a story visibly shows what it submitted.
-->
