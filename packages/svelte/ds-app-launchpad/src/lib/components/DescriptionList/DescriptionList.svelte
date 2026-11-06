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
    <dt>ID</dt>
    <dd>134</dd>
  </DescriptionList.Item>
  <DescriptionList.Item>
    <dt>Requested by</dt>
    <dd>John Smith</dd>
  </DescriptionList.Item>
  <DescriptionList.Item>
    <dt>Created</dt>
    <dd>2023-10-01T12:00:00Z</dd>
  </DescriptionList.Item>
  <DescriptionList.Item>
    <dt>Status</dt>
    <dd>Active</dd>
  </DescriptionList.Item>
</DescriptionList>
```
-->
