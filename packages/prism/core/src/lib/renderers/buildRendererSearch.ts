import { VIEW_PARAMS } from "./constants.js";

/**
 * The search parameters of the address that shows a view in another
 * renderer: every current parameter kept, `as` set to the renderer (left
 * out for the default, so the default's address carries none), and
 * `expand` dropped, since an expanded relation belongs to the renderer
 * that drew it.
 *
 * @param current - The address's search parameters.
 * @param name - The renderer to show.
 * @param defaultName - The view's default renderer.
 * @returns The next address's search parameters; `undefined` removes one.
 */
export default function buildRendererSearch(
  current: Readonly<Record<string, string>>,
  name: string,
  defaultName: string,
): Readonly<Record<string, string | undefined>> {
  return {
    ...current,
    [VIEW_PARAMS.renderer]: name === defaultName ? undefined : name,
    [VIEW_PARAMS.expand]: undefined,
  };
}
