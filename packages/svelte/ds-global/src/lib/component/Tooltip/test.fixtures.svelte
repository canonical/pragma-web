<script lang="ts" module>
  import { Icon } from "../Icon/index.js";

  export const messageText = "Tooltip Message";
  export const contentText = "Tooltip Content";
  export const targetText = "Target Element";
  export { content, icon, message, target, targetButton };
</script>

{#snippet content()}{contentText}{/snippet}

{#snippet message()}{messageText}{/snippet}

{#snippet icon()}<Icon icon="information" />{/snippet}

{#snippet target()}<span>{targetText}</span>{/snippet}

{#snippet targetButton()}<button type="button">{targetText}</button>{/snippet}
