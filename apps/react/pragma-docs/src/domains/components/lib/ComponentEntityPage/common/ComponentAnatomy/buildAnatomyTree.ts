import type {
  Edge,
  Node,
  Relation,
  Specification,
  Switch,
} from "@canonical/anatomy-dsl";
import type { AnatomyTreeNode } from "../../../AnatomyTree/index.js";
import { ROOT_STEP, SWITCH_STEP } from "./constants.js";

/** Where a node stands under its parent: the relation placing it, or the case it is. */
interface Placement {
  readonly relation?: Relation;
  readonly caseValue?: string;
}

/** Name the step a node takes in a path: its URI, or its role. */
function nameStep(node: Node): string {
  return node.type === "named" ? node.uri : node.role;
}

/** Read a block's local name off its URI: `button` for `global.component.button`. */
function readLocalName(uri: string): string {
  return uri.split(".").at(-1) ?? uri;
}

/** Copy a relation's cardinality and slot, the parts the tree shows. */
function copyRelation(relation: Relation): AnatomyTreeNode["relation"] {
  return relation.slotName === undefined
    ? { cardinality: relation.cardinality }
    : { cardinality: relation.cardinality, slotName: relation.slotName };
}

/** Whether an edge's target is a switch. */
function isSwitch(target: Edge["target"]): target is Switch {
  return "cases" in target;
}

/**
 * Give each step its 1-based ordinal in brackets when the step recurs
 * among its siblings: the binding path grammar's own rule, so two sibling
 * roles keep two identities.
 */
function numberSteps(steps: readonly string[]): string[] {
  const totals = new Map<string, number>();
  for (const step of steps) totals.set(step, (totals.get(step) ?? 0) + 1);
  const seen = new Map<string, number>();
  return steps.map((step) => {
    const ordinal = (seen.get(step) ?? 0) + 1;
    seen.set(step, ordinal);
    return (totals.get(step) ?? 0) > 1 ? `${step}[${ordinal}]` : step;
  });
}

/**
 * Build one node and its subtree at `path`: a named block takes its local
 * name and, when `resolveHref` gives one, its page; a role takes its role.
 */
function buildNode(
  node: Node,
  path: string,
  placement: Placement,
  resolveHref: (uri: string) => string | undefined,
): AnatomyTreeNode {
  const href = node.type === "named" ? resolveHref(node.uri) : undefined;
  return {
    id: path,
    label: node.type === "named" ? readLocalName(node.uri) : node.role,
    form: node.type,
    ...(placement.relation === undefined
      ? {}
      : { relation: copyRelation(placement.relation) }),
    ...(placement.caseValue === undefined
      ? {}
      : { caseValue: placement.caseValue }),
    styleCount: node.styles?.length ?? 0,
    ...(href === undefined ? {} : { href }),
    children: buildChildren(node, path, resolveHref),
  };
}

/**
 * Build a node's children in edge order. A node takes its step; a switch
 * becomes a node of its own, at the step `switch`, holding its cases, each
 * at the step `case[<value>]` under the switch's parent, as the binding
 * path grammar addresses a case; every step is numbered among its
 * siblings.
 */
function buildChildren(
  node: Node,
  path: string,
  resolveHref: (uri: string) => string | undefined,
): AnatomyTreeNode[] {
  const edges = node.edges ?? [];
  const steps = numberSteps(
    edges.flatMap(({ target }) =>
      isSwitch(target)
        ? [
            SWITCH_STEP,
            ...target.cases.map((switchCase) => `case[${switchCase.value}]`),
          ]
        : [nameStep(target)],
    ),
  );
  let index = 0;
  const takeStep = (): string => {
    const step = steps.at(index);
    index += 1;
    if (step === undefined) {
      throw new Error("buildAnatomyTree: a child has no step");
    }
    return step;
  };
  return edges.map(({ target, relation }) => {
    if (!isSwitch(target)) {
      return buildNode(
        target,
        `${path}/${takeStep()}`,
        { relation },
        resolveHref,
      );
    }
    const switchPath = `${path}/${takeStep()}`;
    return {
      id: switchPath,
      label: relation.slotName ?? target.discriminator,
      form: "switch",
      discriminator: target.discriminator,
      relation: copyRelation(relation),
      styleCount: 0,
      children: target.cases.map((switchCase) =>
        buildNode(
          switchCase.node,
          `${path}/${takeStep()}`,
          { caseValue: switchCase.value },
          resolveHref,
        ),
      ),
    };
  });
}

/**
 * Build the tree the anatomy figure draws from a block's parsed anatomy:
 * each node's path in the binding path grammar (`$root`, then each step's
 * URI or role, `case[<value>]` for a switch's case, a repeated sibling's
 * step with its ordinal), its name, its form, the relation placing it,
 * its count of style declarations and, for a named block, its page when
 * `resolveHref` gives one. A switch, which is no node of the anatomy,
 * becomes a node of its own between its parent and its cases.
 *
 * @param specification - The block's anatomy, as `readAnatomy` reads it.
 * @param resolveHref - The page of a block, by its URI, or `undefined`.
 * @returns The tree's root.
 */
export default function buildAnatomyTree(
  specification: Specification,
  resolveHref: (uri: string) => string | undefined,
): AnatomyTreeNode {
  return buildNode(specification.root, ROOT_STEP, {}, resolveHref);
}
