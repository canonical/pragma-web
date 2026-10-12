<!-- @canonical/generator-ds 0.17.1 -->

<script lang="ts">
  import { setDescriptionListContext } from "./context.js";
  import "./styles.css";
  import type { DescriptionListProps } from "./types.js";

  const componentCssClassName = "ds description-list";

  let {
    class: className,
    children,
    layout = "auto",
    ...rest
  }: DescriptionListProps = $props();

  setDescriptionListContext({
    get layout() {
      return layout;
    },
  });
</script>

<!-- Container queries cannot target the same element they are defined on -->
<div class="ds description-list-container">
  <dl class={[componentCssClassName, className, layout]} {...rest}>
    {@render children?.()}
  </dl>
</div>

<!-- @component
`DescriptionList` represents a list of terms and their corresponding descriptions, typically used to display metadata or key-value pairs in a structured format.

## Example Usage
```svelte
<DescriptionList layout="list">
  <DescriptionList.Item>
    {#snippet name()}ID{/snippet}
    {#snippet description()}134{/snippet}
  </DescriptionList.Item>
  <DescriptionList.Item>
    {#snippet name()}Requested by{/snippet}
    {#snippet description()}John Smith{/snippet}
  </DescriptionList.Item>
  <DescriptionList.Item>
    {#snippet name()}Created{/snippet}
    {#snippet description()}2023-10-01T12:00:00Z{/snippet}
  </DescriptionList.Item>
  <DescriptionList.Item>
    {#snippet name()}Status{/snippet}
    {#snippet description()}Active{/snippet}
  </DescriptionList.Item>
</DescriptionList>
```
-->
