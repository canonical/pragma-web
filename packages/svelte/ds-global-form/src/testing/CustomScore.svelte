<script lang="ts">
  import type { CustomControlProps } from "../lib/pattern/Field/types.js";

  // A custom control for tests: it renders its own label, description and
  // error from the props `Field` forwards.
  let {
    name,
    label,
    description,
    error,
    value = $bindable(),
    step,
  }: CustomControlProps<number> & { step: number } = $props();
</script>

<label class="score">{label}<input type="number" {name} {step} bind:value /></label><p class="score-description">{description}</p><p class="score-error">{error}</p>
