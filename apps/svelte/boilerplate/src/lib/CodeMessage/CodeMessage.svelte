<script lang="ts">
  import type { CodeMessageProps } from "./types.js";

  let { message, ...rest }: CodeMessageProps = $props();

  // Splitting on backticks leaves prose at even indexes and code at odd ones.
  const parts = $derived(message.split("`"));
</script>

<p {...rest}>{#each parts as part, index}{#if index % 2 === 1}<code class="ds inline-code code">{part}</code>{:else}{part}{/if}{/each}</p>

<!-- @component
A translated paragraph that names code. The message marks code names with
backticks, as Markdown does, and each one renders with the markup of React's
`InlineCode`, which `@canonical/svelte-ds-global` does not ship yet.

`import { CodeMessage } from "$lib";`
-->
