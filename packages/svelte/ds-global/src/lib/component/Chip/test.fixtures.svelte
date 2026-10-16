<script lang="ts" module>
  import type { ChipDismissProps } from "./common/index.js";
  import { Chip } from "./index.js";

  export { customIcon, defaultDismiss, duplicateDismiss };
</script>

<script lang="ts">
  let {
    lead = "Owner",
    value = "Bob",
    dismissProps,
    showDismiss = true,
    secondChip = false,
  }: {
    lead?: string;
    value?: string;
    dismissProps: ChipDismissProps;
    showDismiss?: boolean;
    secondChip?: boolean;
  } = $props();
</script>

<Chip {lead} {value} class="custom-chip" id="chip-root">
  {#if showDismiss}
    <Chip.Dismiss {...dismissProps} />
  {/if}
</Chip>

{#if secondChip}
  <Chip lead="Reviewer" value="Alice">
    <Chip.Dismiss onclick={() => {}} />
  </Chip>
{/if}

{#snippet defaultDismiss()}
  <Chip.Dismiss onclick={() => {}} />
{/snippet}

{#snippet duplicateDismiss()}
  <Chip.Dismiss onclick={() => {}} />
  <Chip.Dismiss onclick={() => {}} />
{/snippet}

{#snippet customIcon()}
  <span aria-hidden="true" data-testid="custom-icon">×</span>
{/snippet}
