import type { LinkComponent } from "@canonical/react-ds-global";
import type { ComponentType, ReactNode } from "react";
import type { CardProjection_node$data } from "../../__generated__/CardProjection_node.graphql.js";
import type { ChipProjection_node$data } from "../../__generated__/ChipProjection_node.graphql.js";
import type { CommandProjection_node$data } from "../../__generated__/CommandProjection_node.graphql.js";
import type { GraphNodeProjection_node$data } from "../../__generated__/GraphNodeProjection_node.graphql.js";
import type { RowProjection_node$data } from "../../__generated__/RowProjection_node.graphql.js";
import type {
  CardArmNative,
  ChipArmNative,
  CommandArmNative,
  GraphNodeArmNative,
  RowArmNative,
} from "../node/index.js";

/**
 * What a composite fragment's data holds: the typename dispatch reads, and
 * the `Node` arm's key, spread aliased as `Node`.
 */
export interface DispatchedNode {
  readonly __typename: string;
  readonly Node: unknown;
}

/**
 * The typenames a composite arms besides `Node`: its other spreads, each
 * aliased by the type it is on.
 */
export type ArmedTypename<TData> = Exclude<
  keyof TData,
  "__typename" | "Node" | " $fragmentType"
> &
  string;

/** What an arm receives: the dispatcher's native props, and its own fragment key. */
export type ArmProps<TKey, TNative> = TNative & { readonly node: TKey };

/** An arm: the projection of one type in one form. */
export type ProjectionArm<TKey, TNative> = ComponentType<
  ArmProps<TKey, TNative>
>;

/**
 * What a site's arm receives: the props of the `Node` projection it wraps,
 * and the typename of the node it renders.
 */
export type SiteArmProps<TProps> = TProps & { readonly typename: string };

/** One form's arms. */
export interface ProjectionMap<TData extends DispatchedNode, TNative> {
  /** The arm of every type no other arm takes, reading what every node carries. */
  readonly Node: ProjectionArm<TData["Node"], TNative>;
  /**
   * One arm per type the composite arms, each reading its own aliased key:
   * a wrong or missing arm does not compile.
   */
  readonly types: {
    readonly [T in ArmedTypename<TData>]-?: ProjectionArm<
      NonNullable<TData[T]>,
      TNative
    >;
  };
  /**
   * A site's arms for types the composite does not arm, by typename: each
   * reads the `Node` key, and takes the node's typename.
   */
  readonly siteTypes?: Readonly<
    Record<
      string,
      ComponentType<SiteArmProps<ArmProps<TData["Node"], TNative>>>
    >
  >;
}

/** The arms of every form, one map each. */
export interface ProjectionMaps {
  /** The inline mention: a node named in running text. */
  readonly chip: ProjectionMap<ChipProjection_node$data, ChipArmNative>;
  /** The list row: a node as one entry of a list of results. */
  readonly row: ProjectionMap<RowProjection_node$data, RowArmNative>;
  /** The card: a node as a self-contained tile in a grid of entities. */
  readonly card: ProjectionMap<CardProjection_node$data, CardArmNative>;
  /** The command-palette entry: a node offered as a destination. */
  readonly command: ProjectionMap<
    CommandProjection_node$data,
    CommandArmNative
  >;
  /** The graph node: a node of a graph, native SVG. */
  readonly graphNode: ProjectionMap<
    GraphNodeProjection_node$data,
    GraphNodeArmNative
  >;
}

/** Props accepted by `ProjectionsProvider`. */
export interface ProjectionsProviderProps {
  /**
   * The site's maps: `defaultProjectionMaps`, or a site's copy that adds
   * arms for its own types under `siteTypes`. A typed arm reads only what
   * its form's composite spreads, and only the package writes the
   * composites.
   */
  readonly maps: ProjectionMaps;
  /**
   * The link every projection renders a node's home through: the site's
   * router link adapter, so following a mention navigates on the client.
   * Defaults to the intrinsic `"a"`, a full document load.
   */
  readonly LinkComponent?: LinkComponent;
  /** The content whose projections read the maps. */
  readonly children: ReactNode;
}

/** What a `ProjectionsProvider` holds for the projections below it. */
export interface ProjectionsContextValue {
  /** The site's maps, one per form. */
  readonly maps: ProjectionMaps;
  /** The link a node's home renders through. */
  readonly LinkComponent: LinkComponent;
}
