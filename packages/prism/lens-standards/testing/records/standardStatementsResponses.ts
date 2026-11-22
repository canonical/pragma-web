/**
 * The pragma graph's answers to the reading page's requests that the
 * serialised stores do not hold: the statements of the exemplar standard
 * (`react.component.link_component`, which extends `react.component.props`
 * and has one example to follow and one to avoid) and of the standard it
 * extends, and that standard's own entity query (three standards extend
 * it, its "Applies to").
 *
 * Regenerate: execute each entry's operation (its text is the generated
 * artifact's `params.text`), with its variables, against the pragma
 * provider (`createPragmaProvider()` from
 * `@canonical/prism-pragma-provider`, its `handle`), and replace its
 * `response` with the JSON answer. A request a test makes that no entry
 * holds fails that test, naming the operation and the variables to record.
 */

import type { RecordedResponse } from "../types.js";

/** The recorded answers, one per operation and variables. */
const standardStatementsResponses: readonly RecordedResponse[] = [
  {
    operation: "StandardStatementsQuery",
    variables: {
      uri: "http://pragma.canonical.com/codestandards#react.component.link_component",
    },
    response: {
      data: {
        outgoing: {
          groups: [
            {
              predicateUri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              total: 1,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "OntologyClass",
                    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
                    __isNode: "OntologyClass",
                    _meta: {
                      title: "Code Standard",
                      curie: "cs:CodeStandard",
                    },
                  },
                },
              ],
            },
            {
              predicateUri:
                "http://pragma.canonical.com/codestandards#description",
              total: 1,
              values: [
                {
                  __typename: "StatementLiteral",
                },
              ],
            },
            {
              predicateUri: "http://pragma.canonical.com/codestandards#do",
              total: 1,
              values: [
                {
                  __typename: "StatementNested",
                  groups: [
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#code",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            '\n// types.ts — shared contract, defined once and imported (not re-declared per component)\nexport interface LinkComponentProps {\n  href?: string;\n  className?: string;\n  children?: ReactNode;\n  "aria-current"?: HTMLAttributes<HTMLElement>["aria-current"];\n}\n\nexport interface TabsProps extends HTMLAttributes<HTMLElement> {\n  items: NavItem[];\n  /** Router integration. Defaults to "a". Pass a router Link (e.g. @canonical/router-react). */\n  LinkComponent?: ComponentType<LinkComponentProps> | "a";\n}\n\n// Item.tsx — navigable items render through the injected component; others fall back to a span\nconst Item = ({ url, label, active, disabled, LinkComponent = "a" }: ItemProps) => {\n  const Link = LinkComponent;\n  return url ? (\n    <Link href={disabled ? undefined : url} aria-current={active ? "page" : undefined}>\n      {label}\n    </Link>\n  ) : (\n    <span aria-current={active ? "page" : undefined}>{label}</span>\n  );\n};\n    ',
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#description",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            "Inject the link via a single `LinkComponent` prop typed against the shared `LinkComponentProps`, defaulting to the intrinsic anchor, and render a plain element for non-navigable items.",
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#language",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical: "typescript",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              predicateUri: "http://pragma.canonical.com/codestandards#dont",
              total: 1,
              values: [
                {
                  __typename: "StatementNested",
                  groups: [
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#code",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            '\n// Bad: a bespoke, wider interface copied into this component instead of the shared LinkComponentProps\ninterface TabsProps {\n  // Bad: `as` on a COMPLEX multi-item component — there is no single wrapper to\n  // re-target; the link renderer is inner. Use LinkComponent here. (`as` is for\n  // SIMPLE components whose own wrapper element is what gets configured.)\n  as?: ElementType;\n  items: { href: string }[];\n}\n\nconst Item = ({ href, active, as: As = "a" }: ItemProps) => (\n  // Bad: renders the link even when there is no destination; forwards arbitrary anchor props\n  <As href={href} aria-selected={active}>   {/* Bad: aria-selected on a link is non-conformant */}\n    {label}\n  </As>\n);\n    ',
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#description",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            "Re-author the link contract per component, reach for the polymorphic `as` prop for router integration, or render a link for a non-navigable item.",
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#language",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical: "typescript",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              predicateUri: "http://pragma.canonical.com/codestandards#extends",
              total: 1,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "CodeStandard",
                    uri: "http://pragma.canonical.com/codestandards#react.component.props",
                    __isNode: "CodeStandard",
                    _meta: {
                      title: "Documented and spreadable props",
                      curie: "cs:react.component.props",
                    },
                  },
                },
              ],
            },
            {
              predicateUri:
                "http://pragma.canonical.com/codestandards#hasCategory",
              total: 1,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "Category",
                    uri: "http://pragma.canonical.com/codestandards#react",
                    __isNode: "Category",
                    _meta: {
                      title: "React",
                      curie: "cs:react",
                    },
                  },
                },
              ],
            },
            {
              predicateUri: "http://www.w3.org/2000/01/rdf-schema#label",
              total: 1,
              values: [
                {
                  __typename: "StatementLiteral",
                },
              ],
            },
          ],
        },
        incoming: {
          groups: [],
        },
      },
    },
  },
  {
    operation: "StandardEntityQuery",
    variables: {
      uri: "http://pragma.canonical.com/codestandards#react.component.props",
      classUri: "cs:CodeStandard",
    },
    response: {
      data: {
        boundClass: {
          uri: "http://pragma.canonical.com/codestandards#CodeStandard",
          subclasses: [],
        },
        node: {
          __typename: "CodeStandard",
          uri: "http://pragma.canonical.com/codestandards#react.component.props",
          _meta: {
            curie: "cs:react.component.props",
            title: "Documented and spreadable props",
            type: {
              uri: "http://pragma.canonical.com/codestandards#CodeStandard",
              _meta: {
                title: "Code Standard",
              },
            },
            definition:
              "Component props must:\n- Be documented with TSDoc comments\n- Be destructured when used in markup\n- Be spread to the root element when unused\n- Follow type-specific patterns based on what the component renders",
          },
          __isNode: "CodeStandard",
        },
        body: null,
      },
    },
  },
  {
    operation: "StandardStatementsQuery",
    variables: {
      uri: "http://pragma.canonical.com/codestandards#react.component.props",
    },
    response: {
      data: {
        outgoing: {
          groups: [
            {
              predicateUri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              total: 1,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "OntologyClass",
                    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
                    __isNode: "OntologyClass",
                    _meta: {
                      title: "Code Standard",
                      curie: "cs:CodeStandard",
                    },
                  },
                },
              ],
            },
            {
              predicateUri:
                "http://pragma.canonical.com/codestandards#description",
              total: 1,
              values: [
                {
                  __typename: "StatementLiteral",
                },
              ],
            },
            {
              predicateUri: "http://pragma.canonical.com/codestandards#do",
              total: 1,
              values: [
                {
                  __typename: "StatementNested",
                  groups: [
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#code",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            '\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  /** The button\'s text content */\n  label: string;\n  /** Optional icon to display before the label */\n  icon?: React.ReactNode;\n  /** Visual emphasis of the button */\n  emphasis?: ModifierFamily<"emphasis">;\n}\n\nconst Button = ({\n  label,\n  icon,\n  emphasis,\n  className,\n  ...props  // Spread unused HTML button props\n}: ButtonProps) => (\n  <button\n    className={[componentCssClassName, emphasis, className].filter(Boolean).join(" ")}\n    {...props}\n  >\n    {icon}\n    <span>{label}</span>\n  </button>\n);\n    ',
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#description",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            "Document props with TSDoc comments and use proper destructuring and spreading.",
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#language",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical: "typescript",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              predicateUri: "http://pragma.canonical.com/codestandards#dont",
              total: 1,
              values: [
                {
                  __typename: "StatementNested",
                  groups: [
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#code",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            "\n// Bad: Mixing explicit props with spread\nconst Button = (props: ButtonProps) => (\n  <button\n    className={props.className}\n    onClick={props.onClick}  // Should be in ...props\n    {...props}              // Now duplicates onClick\n  >\n    {props.label}\n  </button>\n);\n\n// Bad: Unnecessarily destructuring HTML props\nconst Button = ({\n  label,\n  className,\n  onClick,     // Should be in ...props\n  onFocus,     // Should be in ...props\n  disabled,    // Should be in ...props\n  ...props\n}: ButtonProps) => (\n  <button\n    className={className}\n    onClick={onClick}     // Explicit when it could be spread\n    onFocus={onFocus}    // Explicit when it could be spread\n    disabled={disabled}  // Explicit when it could be spread\n    {...props}\n  >\n    {label}\n  </button>\n);\n    ",
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#description",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical:
                            "Mix explicit and spread props or destructure props unnecessarily.",
                        },
                      ],
                    },
                    {
                      predicateUri:
                        "http://pragma.canonical.com/codestandards#language",
                      values: [
                        {
                          __typename: "StatementLiteral",
                          lexical: "typescript",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              predicateUri:
                "http://pragma.canonical.com/codestandards#hasCategory",
              total: 1,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "Category",
                    uri: "http://pragma.canonical.com/codestandards#react",
                    __isNode: "Category",
                    _meta: {
                      title: "React",
                      curie: "cs:react",
                    },
                  },
                },
              ],
            },
            {
              predicateUri: "http://www.w3.org/2000/01/rdf-schema#label",
              total: 1,
              values: [
                {
                  __typename: "StatementLiteral",
                },
              ],
            },
          ],
        },
        incoming: {
          groups: [
            {
              predicateUri: "http://pragma.canonical.com/codestandards#extends",
              total: 3,
              values: [
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "CodeStandard",
                    uri: "http://pragma.canonical.com/codestandards#react.component.link_component",
                    __isNode: "CodeStandard",
                    _meta: {
                      title: "Router integration via LinkComponent",
                      curie: "cs:react.component.link_component",
                    },
                  },
                },
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "CodeStandard",
                    uri: "http://pragma.canonical.com/codestandards#react.component.props.html_rendering",
                    __isNode: "CodeStandard",
                    _meta: {
                      title: "Extend native HTML element props",
                      curie: "cs:react.component.props.html_rendering",
                    },
                  },
                },
                {
                  __typename: "StatementNode",
                  node: {
                    __typename: "CodeStandard",
                    uri: "http://pragma.canonical.com/codestandards#react.component.props.wrapper",
                    __isNode: "CodeStandard",
                    _meta: {
                      title: "Namespaced props for inner components",
                      curie: "cs:react.component.props.wrapper",
                    },
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
];

export default standardStatementsResponses;
