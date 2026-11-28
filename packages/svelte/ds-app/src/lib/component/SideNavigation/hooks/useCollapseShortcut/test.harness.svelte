<!-- Test harness: calls useCollapseShortcut with the given props. -->
<script lang="ts">
  import useCollapseShortcut from "./useCollapseShortcut.svelte.js";

  let { condition, ontrigger }: { condition?: boolean; ontrigger: () => void } =
    $props();

  useCollapseShortcut({
    get condition() {
      return condition;
    },
    ontrigger: () => ontrigger(),
  });
</script>
