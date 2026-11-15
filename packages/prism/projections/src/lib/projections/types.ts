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
 * A site's switch for one form, as the package's switch of that form
 * renders it: the switch's native props, and the key of its site slot,
 * the site's own compile of `Site<Form>Slot_node`, as the package's
 * composite reads it (its `Site` alias), so a site's slot typed by its own
 * compile takes it.
 */
export type SiteSwitch<TKey, TNative> = ComponentType<
  TNative & { readonly node: TKey }
>;

/**
 * A site's five switches, one per form, each over its site slot. A site
 * whose pages render the package's lenses (their queries spread the
 * package's switches) gives them, so a node of the site's own types
 * reaches the site's arm through the package's switch.
 */
export interface SiteSwitches {
  /** The inline mention. */
  readonly chip: SiteSwitch<ChipProjection_node$data["Site"], ChipArmNative>;
  /** The list row. */
  readonly row: SiteSwitch<RowProjection_node$data["Site"], RowArmNative>;
  /** The card. */
  readonly card: SiteSwitch<CardProjection_node$data["Site"], CardArmNative>;
  /** The command-palette entry. */
  readonly command: SiteSwitch<
    CommandProjection_node$data["Site"],
    CommandArmNative
  >;
  /** The graph node. */
  readonly graphNode: SiteSwitch<
    GraphNodeProjection_node$data["Site"],
    GraphNodeArmNative
  >;
}

/** Props accepted by `ProjectionLinkProvider`. */
export interface ProjectionLinkProviderProps {
  /**
   * The link every projection renders a node's home through: the site's
   * router link adapter, so following a mention navigates on the client.
   * Defaults to the link of the provider above, or the intrinsic `"a"`, a
   * full document load.
   */
  readonly LinkComponent?: LinkComponent;
  /**
   * The site's peek: the element a chip shows for the node at an absolute
   * IRI, such as the site's own card switch read by a query of the site's.
   * Every chip arm takes it through `useProjectionPeek`, so no arm imports
   * it. Without one (here or above), chips show the package's
   * `ProjectionPeek`. A peek that renders nothing for an IRI (`null`, or a
   * component that renders `null`, as one does while loading or for a
   * node it cannot find) shows nothing: the chip's peek is not displayed,
   * frame and dialog alike, and the chip stays a link.
   */
  readonly peek?: (uri: string) => ReactNode;
  /**
   * The site's five switches, each over its site slot: a node the
   * package's switch of a form reaches renders through the site's switch
   * of that form. Without them (here or above), the package's switches
   * render an ontology class through its arm and any other node through
   * its `Node` arm.
   */
  readonly site?: SiteSwitches;
  /** The content whose projections read them. */
  readonly children: ReactNode;
}

/** What a `ProjectionLinkProvider` holds for the projections below it. */
export interface ProjectionsContextValue {
  /** The link a node's home renders through. */
  readonly LinkComponent: LinkComponent;
  /** The site's peek for the node at an absolute IRI, when it gives one. */
  readonly peek?: (uri: string) => ReactNode;
  /** The site's switches, when it gives them. */
  readonly site?: SiteSwitches;
}

/** Props accepted by `AmbientNamespaceProvider`. */
export interface AmbientNamespaceProviderProps {
  /**
   * The prefix of the page's namespace as its CURIEs write it, without its
   * colon: `ds` for a page of `ds:` entities.
   */
  readonly namespace: string;
  /** The content whose identities read it. */
  readonly children: ReactNode;
}
