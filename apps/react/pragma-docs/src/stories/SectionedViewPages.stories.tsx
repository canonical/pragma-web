/**
 * Core's sectioned view on the three page kinds the site lays on it, one
 * story each, so the view's one layout reads across them: a standard (one
 * section, the rule, and two facts: no index, the aside holds the facts),
 * a component (its sections in the lens's order: an index from three
 * sections up, and its facts) and a guide (no section and no fact: no
 * index and no aside). Each page's own stories stay with the page.
 */

import { route } from "@canonical/router-core";
import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComponentEntityPage } from "#domains/components";
import { guidesRoutes } from "#domains/guides";
import { standardsRoutes } from "#domains/standards";
import {
  withProjections,
  withRouter,
} from "../../.storybook/decorators/index.js";
import { SITE_ROUTES } from "../../.storybook/siteRoutes.js";
import { BUTTON_ANATOMY_DSL } from "../../testing/anatomyTexts.js";
import { MOCK_UI_BLOCK_WITH_EXAMPLE } from "../../testing/projectionEntities.js";
import resolveRoot from "../../testing/resolveRoot.js";

const StandardPage = standardsRoutes.standardEntity.content;
const GuidePage = guidesRoutes.guide.content;

/** Name-compatible bare routes, so the standard's breadcrumb resolves
 * without mounting the lens's real pages. */
const bareStandardsRoutes = {
  standards: route({ url: "/standards", content: () => null }),
  standardEntity: route({ url: "/standards/:uri", content: () => null }),
} as const;

const meta: Meta = {
  title: "Prism/SectionedView pages",
  tags: ["autodocs"],
  parameters: { grid: "intrinsic" },
};

export default meta;
type Story = StoryObj;

/** A standard: one section, the rule, and two facts, so no index. */
export const Standard: Story = {
  decorators: [withProjections(), withRouter({ routes: bareStandardsRoutes })],
  parameters: {
    relay: {
      mockResolvers: {
        // One `OntologyClass` mock serves both `boundClass` and the node's
        // `_meta.type`, so the class guard sees matching IRIs and the
        // article renders, which is the production condition.
        OntologyClass: () => ({
          uri: "http://pragma.canonical.com/codestandards#CodeStandard",
        }),
        EntityMeta: () => ({
          curie: "cs:code.array.safe_access",
          title: "code.array.safe_access",
          definition:
            "Use `.at(index)` instead of bracket notation for array element access.\n\nBracket notation returns `T` even though the index may be out of bounds.",
        }),
        Query: () => ({ prose: null }),
      },
    },
  },
  render: () => (
    <StandardPage
      params={{
        uri: "http://pragma.canonical.com/codestandards#code.array.safe_access",
      }}
      search={{}}
    />
  ),
};

/** A component: its sections in the lens's order, with their index, and
 * its facts. */
export const Component: Story = {
  decorators: [
    withProjections(),
    withRouter({ routes: SITE_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: {
    relay: {
      mockResolvers: {
        Component: resolveRoot({
          ...MOCK_UI_BLOCK_WITH_EXAMPLE,
          name: "Button",
          anatomyDsl: BUTTON_ANATOMY_DSL,
        }),
      },
    },
  },
  render: () => (
    <ComponentEntityPage params={{ uri: "ds:global.component.button" }} />
  ),
};

/** A guide: its address over its text, with no section, no index and no
 * aside. */
export const Guide: Story = {
  render: () => <GuidePage params={{ slug: "router-core" }} search={{}} />,
};
