import {
  CardProjection,
  ChipProjection,
  CommandProjection,
  GraphNodeProjection,
  RowProjection,
} from "@canonical/prism-projections";
import {
  UIBlockCard,
  UIBlockChip,
  UIBlockCommand,
  UIBlockGraphNode,
  UIBlockRow,
} from "#domains/components/lib";
import {
  ModifierCard,
  ModifierChip,
  ModifierCommand,
  ModifierFamilyCard,
  ModifierFamilyChip,
  ModifierFamilyCommand,
  ModifierFamilyGraphNode,
  ModifierFamilyRow,
  ModifierGraphNode,
  ModifierRow,
} from "#domains/modifiers/lib";
import {
  CodeStandardCard,
  CodeStandardChip,
  CodeStandardCommand,
  CodeStandardGraphNode,
  CodeStandardRow,
} from "#domains/standards/lib";
import type { SiteProjectionMaps } from "./types.js";

/**
 * The site's maps, which its dispatchers read: in each form a component, a
 * pattern and a layout render through the UI block's projection, and a
 * modifier, a modifier family and a code standard through their own; every
 * other node renders through the package's dispatcher of that form, which
 * reads the maps the site provides, so ontology classes and any type those
 * maps arm still dispatch as the package does.
 */
export const siteProjectionMaps: SiteProjectionMaps = {
  chip: {
    Node: ChipProjection,
    types: {
      Component: UIBlockChip,
      Pattern: UIBlockChip,
      Layout: UIBlockChip,
      Modifier: ModifierChip,
      ModifierFamily: ModifierFamilyChip,
      CodeStandard: CodeStandardChip,
    },
  },
  row: {
    Node: RowProjection,
    types: {
      Component: UIBlockRow,
      Pattern: UIBlockRow,
      Layout: UIBlockRow,
      Modifier: ModifierRow,
      ModifierFamily: ModifierFamilyRow,
      CodeStandard: CodeStandardRow,
    },
  },
  card: {
    Node: CardProjection,
    types: {
      Component: UIBlockCard,
      Pattern: UIBlockCard,
      Layout: UIBlockCard,
      Modifier: ModifierCard,
      ModifierFamily: ModifierFamilyCard,
      CodeStandard: CodeStandardCard,
    },
  },
  command: {
    Node: CommandProjection,
    types: {
      Component: UIBlockCommand,
      Pattern: UIBlockCommand,
      Layout: UIBlockCommand,
      Modifier: ModifierCommand,
      ModifierFamily: ModifierFamilyCommand,
      CodeStandard: CodeStandardCommand,
    },
  },
  graphNode: {
    Node: GraphNodeProjection,
    types: {
      Component: UIBlockGraphNode,
      Pattern: UIBlockGraphNode,
      Layout: UIBlockGraphNode,
      Modifier: ModifierGraphNode,
      ModifierFamily: ModifierFamilyGraphNode,
      CodeStandard: CodeStandardGraphNode,
    },
  },
};
