import I18nDecorator from "./I18nDecorator.svelte";

/**
 * Wraps every story in the app's locale source. The locale comes from the
 * `locale` toolbar global, or from a story's own `globals`.
 */
export const withI18n =
  () => (_story: unknown, context: { globals: { locale?: string } }) => ({
    // biome-ignore lint/suspicious/noExplicitAny: the decorator wraps any story
    Component: I18nDecorator as any,
    props: { locale: context.globals.locale },
  });
