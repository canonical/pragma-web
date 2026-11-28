<script lang="ts" module>
  import type { StandInEntry } from "./types.js";

  export const items: StandInEntry[] = [
    { key: "one" },
    { key: "two" },
    { type: "separator", key: "separator" },
    { key: "three" },
  ];

  export { row, trigger };
</script>

{#snippet row(key: string)}<span class="label">Row {key}</span>{/snippet}
{#snippet trigger()}<span>Open menu</span>{/snippet}
