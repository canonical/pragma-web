<script lang="ts" module>
  import { Content, Header } from "./common/index.js";

  const headerText = "Header";
  const contentText = "Content";

  export { contentOnly, contentText, headerText, sections, testIdSections };
</script>

{#snippet sections()}
  <Header>{headerText}</Header>
  <Content>{contentText}</Content>
{/snippet}

{#snippet testIdSections()}
  <Header data-testid="header">{headerText}</Header>
  <Content data-testid="content">{contentText}</Content>
{/snippet}

{#snippet contentOnly()}
  {#if false}
    <Header>{headerText}</Header>
  {/if}
  <Content>{contentText}</Content>
{/snippet}
