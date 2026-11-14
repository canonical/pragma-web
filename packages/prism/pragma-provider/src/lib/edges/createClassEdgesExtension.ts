import type { CompilerContext } from "@canonical/ke-graphql";
import type { ClassEdge } from "@canonical/prism-contract";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from "graphql";
import type { ExtensionFactory } from "../extensions/index.js";

/**
 * The class edges the request context carries.
 *
 * @throws When the context carries none: only the provider's handler builds them.
 */
const readClassEdges = (context: CompilerContext): readonly ClassEdge[] => {
  const { classEdges } = context;
  if (!Array.isArray(classEdges)) {
    throw new Error(
      "the request context carries no class edges: build them with createPragmaProvider's handler",
    );
  }
  return classEdges;
};

/**
 * The extension adding `Query.classEdges`: the edges between classes, each
 * weighed by the statements it covers, read from the request context where
 * the provider puts the ones it counted at boot. The descriptions are the
 * contract's, word for word.
 */
export const createClassEdgesExtension = (): ExtensionFactory => () => {
  const classEdge = new GraphQLObjectType<ClassEdge>({
    name: "ClassEdge",
    description:
      "An edge between two classes through one property, weighed by the instance\nstatements it covers. A declared edge comes from the property's domain and\nrange and counts the statements whose subject is an instance of the domain or\na subclass and whose object is an instance of the range or a subclass; it is\nserved with count 0 when none exists. An undeclared edge is a pair of classes\nthe store links through the property that no declaration covers.",
    fields: {
      property: {
        type: new GraphQLNonNull(GraphQLID),
        description: "The property's IRI.",
      },
      subjectClass: {
        type: new GraphQLNonNull(GraphQLID),
        description:
          "The IRI of the class the statements start from: the domain when declared.",
      },
      objectClass: {
        type: new GraphQLNonNull(GraphQLID),
        description:
          "The IRI of the class the statements point to: the range when declared.",
      },
      count: {
        type: new GraphQLNonNull(GraphQLInt),
        description:
          "The number of instance statements the edge covers; 0 when none.",
      },
      declared: {
        type: new GraphQLNonNull(GraphQLBoolean),
        description:
          "Whether the ontology declares the edge through the property's domain and range.",
      },
    },
  });
  const classEdges: GraphQLFieldConfig<unknown, CompilerContext> = {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(classEdge))),
    description:
      "Every edge between classes, sorted by property, subject class and object class.",
    resolve: (_root, _args, context) => readClassEdges(context),
  };
  return { Query: { classEdges } };
};
