import { default as CardRoot } from "./Card.svelte";
import { Content, Footer, Header, Image } from "./common/index.js";

const Card = CardRoot as typeof CardRoot & {
  /**
   * `Card.Content` is the card's padded body: the core section of every card.
   *
   * @example
   * ```svelte
   * <Card.Content><p class="p">Body</p></Card.Content>
   * ```
   */
  Content: typeof Content;
  /**
   * `Card.Footer` holds tags and labels in a wrapping row, not CTAs or links.
   *
   * @example
   * ```svelte
   * <Card.Footer>LTS</Card.Footer>
   * ```
   */
  Footer: typeof Footer;
  /**
   * `Card.Header` holds the title. It merges with a `Card.Content` that
   * follows it: no divider is drawn between them.
   *
   * @example
   * ```svelte
   * <Card.Header><h4>Title</h4></Card.Header>
   * ```
   */
  Header: typeof Header;
  /**
   * `Card.Image` is a full-bleed image spanning the card's width.
   *
   * @example
   * ```svelte
   * <Card.Image src="/image.png" alt="" />
   * ```
   */
  Image: typeof Image;
};

Card.Content = Content;
Card.Footer = Footer;
Card.Header = Header;
Card.Image = Image;

export type {
  ContentProps as CardContentProps,
  FooterProps as CardFooterProps,
  HeaderProps as CardHeaderProps,
  ImageProps as CardImageProps,
} from "./common/index.js";
export type * from "./types.js";
export { Card };
