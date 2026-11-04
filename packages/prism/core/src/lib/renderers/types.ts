import type { ProviderExtension } from "@canonical/prism-contract";
import type { StandardSchemaV1 } from "@canonical/router-core";
import type { ReactNode } from "react";
import type { FILTER_PLACEMENTS, RENDERER_KINDS } from "./constants.js";

/** The kinds of view that carry renderers. */
export type RendererKind = (typeof RENDERER_KINDS)[number];

/** Where a lens places its facets. */
export type FilterPlacement = (typeof FILTER_PLACEMENTS)[number];

/** What a renderer's `offered` reads to decide whether the data allows it. */
export interface RendererFacts {
  /** The provider extensions the site's provider serves. */
  readonly extensions: ReadonlySet<ProviderExtension>;
  /** How many relations hold among the set's members, when counted. */
  readonly relations?: number;
}

/**
 * One way to render a view, as plain data: its name in the address, its
 * label on the switch, what it renders, and whether the data allows it. The
 * shape of the dataviews stack's renderer choice (`id`, `label`, `content`)
 * under the names the address and the lenses use.
 */
export interface Renderer<TProps> {
  /** The renderer's name: the `as` value that selects it. */
  readonly name: string;
  /** The renderer's label on the switch, in the reader's language. */
  readonly label: string;
  /** Render the view with this renderer. */
  readonly render: (props: TProps) => ReactNode;
  /**
   * Whether the data allows this renderer; it is offered when omitted.
   * A renderer the data does not allow is left off the switch.
   */
  readonly offered?: (facts: RendererFacts) => boolean;
}

/** What a list renderer renders: the index's items, and its empty line. */
export interface ListRendererProps {
  /** The index's items, each in the renderer's own form. */
  readonly children: ReactNode;
  /** What the index shows when it has no items. */
  readonly empty?: ReactNode;
}

/** What a page renderer renders: one entity's page. */
export interface PageRendererProps {
  /** The entity's absolute IRI. */
  readonly uri: string;
  /** The entity's title. */
  readonly title: string;
  /** The page as the lens renders it. */
  readonly children: ReactNode;
}

/**
 * One renderer a lens declares: a site default by name, or a renderer of
 * its own under a name, which overloads the default of that name.
 */
export type RendererDeclaration<TProps> =
  | string
  | {
      readonly name: string;
      readonly renderer: Renderer<TProps>;
    };

/** The renderers a site offers every lens, by kind of view. */
export interface RendererDefaults {
  readonly list: readonly Renderer<ListRendererProps>[];
  readonly page: readonly Renderer<PageRendererProps>[];
}

/**
 * The renderers one lens declares, by kind of view; a kind it leaves out
 * takes the site's defaults.
 */
export interface LensRenderers {
  readonly list?: readonly RendererDeclaration<ListRendererProps>[];
  readonly page?: readonly RendererDeclaration<PageRendererProps>[];
}

/** The renderers a view offers, and the one its address selects. */
export interface ResolvedRenderers<TProps> {
  readonly offered: readonly Renderer<TProps>[];
  readonly active: Renderer<TProps>;
}

/**
 * A view's search parameters, each absent when the address has none. Absent
 * rather than empty, so a link the router rebuilds from a matched address
 * writes no parameter the address did not carry.
 */
export interface ViewSearch {
  readonly as?: string;
  readonly q?: string;
  readonly sheet?: string;
  readonly graph?: string;
  readonly select?: string;
  readonly expand?: string;
}

/** The search schema every route with a strip declares. */
export type ViewSearchSchema = StandardSchemaV1<
  Readonly<Record<string, unknown>>,
  ViewSearch
>;

/** What the renderers context holds: the site's defaults and its facts. */
export interface RenderersValue {
  readonly defaults: RendererDefaults;
  readonly facts: RendererFacts;
}

/** Props accepted by `RenderersProvider`. */
export interface RenderersProviderProps {
  /** The renderers the site offers every lens. */
  readonly defaults: RendererDefaults;
  /** The provider extensions the site's provider serves. */
  readonly extensions: readonly ProviderExtension[];
  /** The routed content that reads renderers. */
  readonly children: ReactNode;
}
