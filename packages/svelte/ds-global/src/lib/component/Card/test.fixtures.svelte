<script lang="ts" module>
  import { Content, Footer, Header, Image } from "./common/index.js";

  const cardText = "Card";
  const titleText = "Title";
  const bodyText = "Body";
  const tagText = "tag";
  const imageSrc = "test.png";

  export {
    bodyText,
    cardText,
    composition,
    imageSrc,
    tagText,
    text,
    titleText,
  };
</script>

{#snippet text()}{cardText}{/snippet}

{#snippet composition()}
  <Image src={imageSrc} alt="" />
  <Header>{titleText}</Header>
  <Content>{bodyText}</Content>
  <Footer><span>{tagText}</span></Footer>
{/snippet}
