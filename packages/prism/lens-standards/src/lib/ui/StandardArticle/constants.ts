/**
 * The code standards vocabulary's namespace: the predicates the reading
 * page reads from a standard's statements are in it.
 */
const CS_NAMESPACE = "http://pragma.canonical.com/codestandards#";

/**
 * The absolute IRIs of the predicates the reading page draws as sections:
 * a standard's examples to follow and to avoid, the standards it extends,
 * and, inside an example, its description, its language and its code.
 */
export const CS_PREDICATES = {
  do: `${CS_NAMESPACE}do`,
  dont: `${CS_NAMESPACE}dont`,
  extends: `${CS_NAMESPACE}extends`,
  description: `${CS_NAMESPACE}description`,
  language: `${CS_NAMESPACE}language`,
  code: `${CS_NAMESPACE}code`,
} as const;
