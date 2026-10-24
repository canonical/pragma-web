import type { ReactElement } from "react";
import type {
  ArmedTypename,
  ArmProps,
  DispatchedNode,
  ProjectionArm,
  ProjectionMap,
} from "./types.js";

/** Whether `typename` is one the map's typed arms take. */
function isArmed<TData extends DispatchedNode, TNative>(
  map: ProjectionMap<TData, TNative>,
  typename: string,
): typename is ArmedTypename<TData> {
  return Object.hasOwn(map.types, typename);
}

/**
 * Render the typed arm for `typename` over its aliased key, or `undefined`
 * when the alias did not resolve: the node's typename names the arm, but
 * the store holds no data under that type's spread.
 */
function renderTypeArm<
  TData extends DispatchedNode,
  TNative extends object,
  T extends ArmedTypename<TData>,
>(
  map: ProjectionMap<TData, TNative>,
  typename: T,
  data: TData,
  native: TNative,
): ReactElement | undefined {
  const key = data[typename];
  if (key == null) return undefined;
  const Arm: ProjectionArm<NonNullable<TData[T]>, TNative> = map.types[
    typename
  ];
  const props: ArmProps<NonNullable<TData[T]>, TNative> = {
    ...native,
    node: key,
  };
  return <Arm {...props} />;
}

/**
 * Render the arm a node's typename selects in one form's map: the typed arm
 * for its type when the map has one and its alias resolved, else the
 * site's arm for its typename, else the `Node` arm, which reads what every
 * node carries. A site's own dispatcher calls it over a composite of its
 * own, so its arms and the package's dispatch alike.
 *
 * `import { renderArm } from "@canonical/prism-projections";`
 *
 * @param map - The form's arms.
 * @param data - The composite fragment's data: the typename and every
 *   arm's aliased key.
 * @param native - The dispatcher's native props, handed to the arm.
 * @returns The arm's element.
 */
export default function renderArm<
  TData extends DispatchedNode,
  TNative extends object,
>(
  map: ProjectionMap<TData, TNative>,
  data: TData,
  native: TNative,
): ReactElement {
  const typename = data.__typename;
  const typed = isArmed(map, typename)
    ? renderTypeArm(map, typename, data, native)
    : undefined;
  if (typed !== undefined) return typed;
  const SiteArm = map.siteTypes?.[typename];
  if (SiteArm !== undefined) {
    return <SiteArm {...native} node={data.Node} typename={typename} />;
  }
  const NodeArm = map.Node;
  return <NodeArm {...native} node={data.Node} />;
}
