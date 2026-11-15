import { markGuarded } from "./coverageGuard.js";
import type { GuardableMap } from "./types.js";

/**
 * Guard a test tree's projection maps for `expectSwitchCoverage`: outside
 * a coverage, return the maps as given; while it renders a case, return
 * them with every typed arm and every site arm replaced by one that
 * throws. A switch's default branch renders through the maps, so a
 * typed arm in them would render a node whose case the switch lacks, and
 * the coverage would pass; guarded, the node reaches its typed arm only
 * through the switch's own case.
 *
 * Every test tree that provides projection maps passes them through it:
 * `expectSwitchCoverage` fails a case whose tree did not.
 *
 * @param maps - The maps the tree provides, one per form.
 * @returns The maps, guarded while a coverage renders a case.
 * @note Impure: reads and records the coverage's guard state.
 */
export default function guardTypedArms<
  TMaps extends { readonly [Form in keyof TMaps]: GuardableMap },
>(maps: TMaps): TMaps {
  if (!markGuarded()) return maps;
  const forms: [string, GuardableMap][] = Object.entries(maps);
  const guardedMaps = Object.fromEntries(
    forms.map(([form, map]) => [
      form,
      {
        ...map,
        types: refuseArms(form, map.types),
        ...(map.siteTypes === undefined
          ? {}
          : { siteTypes: refuseArms(form, map.siteTypes) }),
      },
    ]),
  );
  // Each map keeps its keys, and every arm under them is a component that
  // throws, which any arm's type admits.
  return guardedMaps as TMaps;
}

/** Replace each arm of `arms` with one that throws when it renders. */
function refuseArms(form: string, arms: object): Record<string, () => never> {
  return Object.fromEntries(
    Object.keys(arms).map((typename) => [
      typename,
      (): never => {
        throw new Error(
          `the ${form} map's arm for ${typename} rendered: under a switch's coverage a node reaches its typed arm only through the switch's own case`,
        );
      },
    ]),
  );
}
