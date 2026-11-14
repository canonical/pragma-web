import { type GraphQLSchema, printSchema } from "graphql";

/**
 * The SDL of the schema a provider serves: the compiler's provenance header,
 * then the served schema printed.
 *
 * @param compiledSdl - The compiler's SDL: its header, then its schema printed.
 * @param compiled - The schema the compiler built.
 * @param served - The schema the provider serves.
 * @returns The header followed by the printed served schema.
 * @throws When the compiler's SDL is not its header followed by its printed
 * schema, so no header-less or doubled SDL is ever written.
 */
export const printServedSdl = (
  compiledSdl: string,
  compiled: GraphQLSchema,
  served: GraphQLSchema,
): string => {
  const printed = printSchema(compiled);
  if (!compiledSdl.endsWith(printed)) {
    throw new Error(
      "ke-graphql's SDL is no longer its header followed by the printed schema",
    );
  }
  return `${compiledSdl.slice(0, compiledSdl.length - printed.length)}${printSchema(served)}`;
};
