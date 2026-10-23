/**
 * `@canonical/prism-lens-standards` ships no Storybook of its own; its page
 * stories live in the docs site, rendered over the site's styles.
 */

import { route } from "@canonical/router-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { standardsRoutes } from "#domains/lenses";
import {
  withProjections,
  withRouter,
} from "../../.storybook/decorators/index.js";

const Component = standardsRoutes.standardEntity.content;

/** The absolute IRI the stories address: `node(id:)` takes nothing else. */
const STANDARD_IRI =
  "http://pragma.canonical.com/codestandards#code.array.safe_access";

/** Name-compatible bare routes, so the breadcrumb resolves without mounting
 * the lens's real pages. */
const bareRoutes = {
  standards: route({ url: "/standards", content: () => null }),
  standardEntity: route({ url: "/standards/:uri", content: () => null }),
} as const;

/**
 * The reading page under the addon's mock Relay environment. The real route
 * feeds this page live graph data; the lens package's own tests render it
 * over captured stores for fidelity.
 */
const meta: Meta<typeof Component> = {
  title: "Prism/StandardReadingPage",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjections(), withRouter({ routes: bareRoutes })],
  parameters: {
    relay: {
      mockResolvers: {
        // One `OntologyClass` mock serves both `boundClass` and the node's
        // `_meta.type`, so the class guard sees matching IRIs and the article
        // renders, which is the production condition.
        OntologyClass: () => ({
          uri: "http://pragma.canonical.com/codestandards#CodeStandard",
        }),
        EntityMeta: () => ({
          curie: "cs:code.array.safe_access",
          title: "code.array.safe_access",
          definition:
            "Use `.at(index)` instead of bracket notation for array element access.\n\nBracket notation returns `T` even though the index may be out of bounds.",
        }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The reading column over a mocked standard with no prose: its
 * description, as plain text. */
export const Default: Story = {
  args: {
    params: { uri: STANDARD_IRI },
    search: {},
  },
  parameters: {
    relay: {
      mockResolvers: {
        Query: () => ({ prose: null }),
      },
    },
  },
};

/** A standard with prose: Markdown, with a chip for the entity it links to
 * by its compact address. */
export const WithProse: Story = {
  args: {
    params: { uri: STANDARD_IRI },
    search: {},
  },
  parameters: {
    relay: {
      mockResolvers: {
        Prose: () => ({
          markdown:
            "## Why `.at()`\n\nBracket access hides an `undefined`; see [safe array access](cs:code.array.safe_access) for the rule, and the [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at).",
          lang: "en",
        }),
      },
    },
  },
};

/** An address the graph does not resolve: the in-canvas not-found alert. */
export const NotFound: Story = {
  args: {
    params: {
      uri: "http://pragma.canonical.com/codestandards#no.such.standard",
    },
    search: {},
  },
  parameters: {
    relay: {
      mockResolvers: {
        Query: () => ({ node: null }),
      },
    },
  },
};
