/**
 * A serialised Relay store snapshot for `StandardStatementsQuery` at the
 * exemplar standard (`react.component.link_component`): its statements in
 * both directions, the store a site that serves the `statements` extension
 * seeds beside `standardEntityRecords` for that standard's reading page.
 *
 * Normalised, not hand-written: the pragma provider's recorded answer
 * (`standardStatementsResponses`, its first entry) committed through the
 * compiled artifact into an empty Relay store, whose source is printed
 * here, so every storage key is Relay's. Regenerate the same way after
 * re-recording that answer.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const standardStatementsRecords = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")':
      {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")',
      },
    'statements(direction:"IN",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")':
      {
        __ref:
          'client:root:statements(direction:"IN",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")',
      },
  },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")',
      __typename: "StatementGroups",
      groups: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0',
      __typename: "StatementGroup",
      predicateUri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0',
      __typename: "StatementNode",
      node: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node',
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node',
      __typename: "OntologyClass",
      uri: "http://pragma.canonical.com/codestandards#CodeStandard",
      _meta: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node:_meta',
      },
    },
  "client:__type:OntologyClass": {
    __id: "client:__type:OntologyClass",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node:_meta':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:0:values:0:node:_meta',
      __typename: "EntityMeta",
      title: "Code Standard",
      curie: "cs:CodeStandard",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#description",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:1:values:0',
      __typename: "StatementLiteral",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#do",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0',
      __typename: "StatementNested",
      groups: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#code",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:0:values:0',
      __typename: "StatementLiteral",
      lexical:
        '\n// types.ts — shared contract, defined once and imported (not re-declared per component)\nexport interface LinkComponentProps {\n  href?: string;\n  className?: string;\n  children?: ReactNode;\n  "aria-current"?: HTMLAttributes<HTMLElement>["aria-current"];\n}\n\nexport interface TabsProps extends HTMLAttributes<HTMLElement> {\n  items: NavItem[];\n  /** Router integration. Defaults to "a". Pass a router Link (e.g. @canonical/router-react). */\n  LinkComponent?: ComponentType<LinkComponentProps> | "a";\n}\n\n// Item.tsx — navigable items render through the injected component; others fall back to a span\nconst Item = ({ url, label, active, disabled, LinkComponent = "a" }: ItemProps) => {\n  const Link = LinkComponent;\n  return url ? (\n    <Link href={disabled ? undefined : url} aria-current={active ? "page" : undefined}>\n      {label}\n    </Link>\n  ) : (\n    <span aria-current={active ? "page" : undefined}>{label}</span>\n  );\n};\n    ',
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#description",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:1:values:0',
      __typename: "StatementLiteral",
      lexical:
        "Inject the link via a single `LinkComponent` prop typed against the shared `LinkComponentProps`, defaulting to the intrinsic anchor, and render a plain element for non-navigable items.",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#language",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:2:values:0:groups:2:values:0',
      __typename: "StatementLiteral",
      lexical: "typescript",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#dont",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0',
      __typename: "StatementNested",
      groups: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1',
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#code",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:0:values:0',
      __typename: "StatementLiteral",
      lexical:
        '\n// Bad: a bespoke, wider interface copied into this component instead of the shared LinkComponentProps\ninterface TabsProps {\n  // Bad: `as` on a COMPLEX multi-item component — there is no single wrapper to\n  // re-target; the link renderer is inner. Use LinkComponent here. (`as` is for\n  // SIMPLE components whose own wrapper element is what gets configured.)\n  as?: ElementType;\n  items: { href: string }[];\n}\n\nconst Item = ({ href, active, as: As = "a" }: ItemProps) => (\n  // Bad: renders the link even when there is no destination; forwards arbitrary anchor props\n  <As href={href} aria-selected={active}>   {/* Bad: aria-selected on a link is non-conformant */}\n    {label}\n  </As>\n);\n    ',
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#description",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:1:values:0',
      __typename: "StatementLiteral",
      lexical:
        "Re-author the link contract per component, reach for the polymorphic `as` prop for router integration, or render a link for a non-navigable item.",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#language",
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:3:values:0:groups:2:values:0',
      __typename: "StatementLiteral",
      lexical: "typescript",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#extends",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0',
      __typename: "StatementNode",
      node: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node',
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node',
      __typename: "CodeStandard",
      uri: "http://pragma.canonical.com/codestandards#react.component.props",
      _meta: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node:_meta',
      },
    },
  "client:__type:CodeStandard": {
    __id: "client:__type:CodeStandard",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node:_meta':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:4:values:0:node:_meta',
      __typename: "EntityMeta",
      title: "Documented and spreadable props",
      curie: "cs:react.component.props",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5',
      __typename: "StatementGroup",
      predicateUri: "http://pragma.canonical.com/codestandards#hasCategory",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0',
      __typename: "StatementNode",
      node: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node',
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node',
      __typename: "Category",
      uri: "http://pragma.canonical.com/codestandards#react",
      _meta: {
        __ref:
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node:_meta',
      },
    },
  "client:__type:Category": {
    __id: "client:__type:Category",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node:_meta':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:5:values:0:node:_meta',
      __typename: "EntityMeta",
      title: "React",
      curie: "cs:react",
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6',
      __typename: "StatementGroup",
      predicateUri: "http://www.w3.org/2000/01/rdf-schema#label",
      total: 1,
      values: {
        __refs: [
          'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6:values:0',
        ],
      },
    },
  'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6:values:0':
    {
      __id: 'client:root:statements(direction:"OUT",uri:"http://pragma.canonical.com/codestandards#react.component.link_component"):groups:6:values:0',
      __typename: "StatementLiteral",
    },
  'client:root:statements(direction:"IN",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")':
    {
      __id: 'client:root:statements(direction:"IN",uri:"http://pragma.canonical.com/codestandards#react.component.link_component")',
      __typename: "StatementGroups",
      groups: {
        __refs: [],
      },
    },
} as unknown as RecordMap;

export default standardStatementsRecords;
