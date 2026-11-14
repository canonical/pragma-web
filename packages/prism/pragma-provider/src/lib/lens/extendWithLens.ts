import {
  type LensGroup,
  type SiteLensIndex,
  selectLiteral,
} from "@canonical/prism-contract";
import {
  extendSchema,
  type GraphQLFieldResolver,
  type GraphQLObjectType,
  type GraphQLSchema,
  isObjectType,
  parse,
} from "graphql";
import { LENS_SDL, LENS_TYPE_NAMES } from "./constants.js";

/** Arguments of the lens's language-tagged fields. */
interface LiteralArgs {
  readonly lang?: string | null;
}

/** What ke-graphql resolves an `OntologyClass` or `OntologyProperty` to. */
interface TermSource {
  readonly uri: string;
}

/** What ke-graphql resolves a `ClassProperty` to. */
interface ClassPropertySource {
  readonly classUri: string;
  readonly propertyUri: string;
}

/** A resolver for one lens field. */
// biome-ignore lint/suspicious/noExplicitAny: each resolver narrows its own source and arguments
type LensResolver = GraphQLFieldResolver<any, unknown, any>;

/** The resolvers of the lens fields, by type and field name. */
const createLensResolvers = (
  index: SiteLensIndex,
): Readonly<Record<string, Readonly<Record<string, LensResolver>>>> => ({
  OntologyClass: {
    visibility: (c: TermSource) => index.classLens(c.uri).visibility,
    glyph: (c: TermSource) => index.classLens(c.uri).glyph,
    pluralLabel: (c: TermSource, args: LiteralArgs) =>
      selectLiteral(index.classLens(c.uri).pluralLabels, args.lang),
  },
  ClassProperty: {
    group: (cp: ClassPropertySource) =>
      index.fieldLens(cp.classUri, cp.propertyUri).group,
    order: (cp: ClassPropertySource) =>
      index.fieldLens(cp.classUri, cp.propertyUri).order,
    role: (cp: ClassPropertySource) =>
      index.fieldLens(cp.classUri, cp.propertyUri).role,
    visibility: (cp: ClassPropertySource) =>
      index.fieldLens(cp.classUri, cp.propertyUri).visibility,
  },
  OntologyProperty: {
    visibility: (p: TermSource) => index.propertyLens(p.uri).visibility,
    pluralLabel: (p: TermSource, args: LiteralArgs) =>
      selectLiteral(index.propertyLens(p.uri).pluralLabels, args.lang),
    inverseLabel: (p: TermSource, args: LiteralArgs) =>
      selectLiteral(index.propertyLens(p.uri).inverseLabels, args.lang),
    inversePluralLabel: (p: TermSource, args: LiteralArgs) =>
      selectLiteral(index.propertyLens(p.uri).inversePluralLabels, args.lang),
    inverseVisibility: (p: TermSource) =>
      index.propertyLens(p.uri).inverseVisibility,
  },
  PropertyGroup: {
    label: (group: LensGroup, args: LiteralArgs) =>
      selectLiteral(group.labels ?? {}, args.lang),
    order: (group: LensGroup) => group.order ?? null,
  },
});

/**
 * Serve the type lens on a compiled schema that does not: extend it with the
 * contract's lens fields and types, and resolve them from the site lens.
 *
 * The resolvers are assigned to the new fields only, on a schema
 * `extendSchema` has just built and nothing else holds, so every field the
 * compiler resolves keeps its resolver. Assigning is the one way in: the
 * compiler offers no extension point on its TBox types.
 *
 * @param schema - The compiled schema.
 * @param index - The site lens, resolved against the store's TBox.
 * @returns A new schema serving the lens fields.
 * @throws When the compiled schema already declares a lens type or field:
 * the compiler then reads the lens from the ontologies, and the site lens
 * belongs in Turtle.
 * @note Impure: assigns the resolvers of the new schema's lens fields.
 */
export const extendWithLens = (
  schema: GraphQLSchema,
  index: SiteLensIndex,
): GraphQLSchema => {
  const resolvers = createLensResolvers(index);
  const served = [
    ...LENS_TYPE_NAMES.filter((name) => schema.getType(name) !== undefined),
    ...Object.entries(resolvers).flatMap(([typeName, fields]) => {
      const type = schema.getType(typeName);
      return isObjectType(type)
        ? Object.keys(fields)
            .filter((name) => type.getFields()[name] !== undefined)
            .map((name) => `${typeName}.${name}`)
        : [];
    }),
  ];
  if (served.length > 0) {
    throw new Error(
      `the compiled schema already serves the type lens (${served.join(", ")}): remove the site-lens extension and move the site lens into Turtle`,
    );
  }
  const extended = extendSchema(schema, parse(LENS_SDL));
  // LENS_SDL declares every type and field the resolvers name, and
  // extendSchema refuses a schema lacking the types it extends, so each
  // lookup below finds its field.
  for (const [typeName, fields] of Object.entries(resolvers)) {
    const type = extended.getType(typeName) as GraphQLObjectType;
    for (const [name, resolve] of Object.entries(fields)) {
      type.getFields()[name].resolve = resolve;
    }
  }
  return extended;
};
