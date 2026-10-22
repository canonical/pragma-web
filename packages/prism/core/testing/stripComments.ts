/**
 * Remove a stylesheet's comments, so a rule or a value is read without the
 * prose around it.
 *
 * @param css - The stylesheet's text.
 * @returns The text with every `/* … *\/` comment removed.
 */
export default function stripComments(css: string): string {
  return css.replaceAll(/\/\*[\s\S]*?\*\//g, "");
}
