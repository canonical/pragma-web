/**
 * `@canonical/prism-lens-definitions` ships no Storybook of its own; its page
 * story lives in the docs site, rendered over the site's styles.
 */

import { definitionsRoutes } from "@canonical/prism-lens-definitions";
import { route } from "@canonical/router-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  withProjections,
  withRouter,
} from "../../.storybook/decorators/index.js";

const Component = definitionsRoutes.definitions.content;

/** The same page as the term route types it, whose params carry a term. */
const TermContent = definitionsRoutes.definitionsTerm.content;

/** A name-compatible bare route, so term links resolve without mounting the
 * lens's real page inside itself. */
const bareRoutes = {
  definitionsTerm: route({ url: "/definitions/:term", content: () => null }),
} as const;

/**
 * The full lens page under the addon's mock Relay environment. The real
 * routes feed this page live graph data; the lens package's own tests
 * render it over captured stores for fidelity.
 */
const meta: Meta<typeof Component> = {
  title: "Prism/DefinitionsPage",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjections(), withRouter({ routes: bareRoutes })],
  parameters: {
    relay: {
      mockResolvers: {
        Ontology: () => ({
          prefix: "ds",
          label: "ds",
          namespace: "https://ds.canonical.com/",
        }),
        OntologyClass: () => ({
          uri: "https://ds.canonical.com/UIBlock",
          label: "UI Block",
          definition:
            "A category of visual or abstract entity that fulfills a particular role in composing user interfaces.",
          isAbstract: true,
          namespace: "ds",
          instanceCount: 0,
          superclass: null,
        }),
        OntologyProperty: () => ({
          uri: "https://ds.canonical.com/hasSubcomponent",
          label: "hasSubcomponent",
          kind: "OBJECT",
          functional: false,
          range: "https://ds.canonical.com/Subcomponent",
          namespace: "ds",
        }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The term-less explorer: honest empty inspector. */
export const Explorer: Story = {
  args: {
    params: {},
  },
};

/** A selected term: the inspector shows the mocked class record. Rendered
 * through the term route's content, whose params carry the term. */
export const SelectedTerm: Story = {
  render: () => <TermContent params={{ term: "ds:UIBlock" }} search={{}} />,
};
