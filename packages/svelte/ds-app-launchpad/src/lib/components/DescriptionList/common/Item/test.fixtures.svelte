<script lang="ts" module>
  const descriptionListItemProps = {
    termText: "Term",
    descriptionText: "Description",
  } as const;

  export { descriptionListItem, descriptionListItemProps };
</script>

<!--
  Use a compiled snippet because Item's children are sibling dt and dd elements.
  createRawSnippet expects a single root element and only inserts the first
  sibling, so using it would omit the dd element.
-->
{#snippet descriptionListItem()}
  <dt>{descriptionListItemProps.termText}</dt>
  <dd><span>{descriptionListItemProps.descriptionText}</span></dd>
{/snippet}
