import FormDecorator from "./FormDecorator.svelte";
import OptionGroup from "./OptionGroup.svelte";

interface FormDecoratorParams {
  /** Extra class names for the form element (e.g. "form-layout-side"). */
  className?: string;
}

/**
 * Wraps a story in a Form (`form.ds.form.subgrid`) with its own owner, as a
 * field would sit in a form. A story's own `value` or `error` wins over the
 * owner.
 */
export const form =
  ({ className }: FormDecoratorParams = {}) =>
  () => ({
    // biome-ignore lint/suspicious/noExplicitAny: the shell wraps any story
    Component: FormDecorator as any,
    props: { class: className },
  });

/**
 * Wraps an option story in a borderless group carrying the choice group's
 * classes, so a single option renders as it would inside its group.
 */
export const optionGroup = (className: string) => () => ({
  // biome-ignore lint/suspicious/noExplicitAny: the group wraps any story
  Component: OptionGroup as any,
  props: { class: className },
});
