/**
 * `@canonical/prism-lens-standards` ships no Storybook of its own; its page
 * stories live in the docs site, rendered over the site's styles.
 */

import { route } from "@canonical/router-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { standardsRoutes } from "#domains/lenses";
import { withRouter } from "../../.storybook/decorators/index.js";

const Component = standardsRoutes.standards.content;

/** A name-compatible bare route, so index links resolve without mounting
 * the lens's real reading page. */
const bareRoutes = {
  standardEntity: route({ url: "/standards/:uri", content: () => null }),
} as const;

/**
 * The standards index under the addon's mock Relay environment. The real
 * route feeds this page live graph data; the lens package's own tests render
 * it over captured stores for fidelity.
 */
const meta: Meta<typeof Component> = {
  title: "Prism/StandardsPage",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRouter({ routes: bareRoutes })],
  parameters: {
    relay: {
      mockResolvers: {
        OntologyClass: () => ({
          uri: "http://pragma.canonical.com/codestandards#CodeStandard",
        }),
        EntityMeta: () => ({
          curie: "cs:code.array.safe_access",
          title: "code.array.safe_access",
        }),
        PageInfo: () => ({ hasNextPage: false }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The grouped index over a mocked standard. */
export const Index: Story = {
  args: {
    params: {},
    search: {},
  },
};
