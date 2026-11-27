<script lang="ts" module>
  export const childrenProps = { label: "Link" };
  export { children };
</script>

{#snippet children()}
  <span>{childrenProps.label}</span>
{/snippet}
