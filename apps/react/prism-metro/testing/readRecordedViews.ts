import { createEnvironment } from "@canonical/prism-core";
import {
  type ConcreteRequest,
  createOperationDescriptor,
  type Environment,
  type GraphQLResponse,
} from "relay-runtime";
import networkLineQueryNode, {
  type NetworkLineQuery$data,
} from "#relay/__generated__/NetworkLineQuery.graphql.js";
import networkMapQueryNode from "#relay/__generated__/NetworkMapQuery.graphql.js";
import networkNamespacesQueryNode from "#relay/__generated__/NetworkNamespacesQuery.graphql.js";
import networkStationQueryNode, {
  type NetworkStationQuery$data,
} from "#relay/__generated__/NetworkStationQuery.graphql.js";
import readLineView from "../src/domains/network/lib/readLineView.js";
import readStationView from "../src/domains/network/lib/readStationView.js";
import type {
  LineView,
  StationView,
} from "../src/domains/network/lib/types.js";
import { METRO_NAMESPACE } from "./fixtures.js";
import networkResponses from "./records/networkResponses.js";

/** The compiled operation each recorded answer answers, by its name. */
const OPERATIONS: Readonly<Record<string, ConcreteRequest>> = {
  NetworkLineQuery: networkLineQueryNode,
  NetworkMapQuery: networkMapQueryNode,
  NetworkNamespacesQuery: networkNamespacesQueryNode,
  NetworkStationQuery: networkStationQueryNode,
};

/** Whether two variable records hold the same values, in any order. */
const sameVariables = (
  a: Readonly<Record<string, unknown>>,
  b: Readonly<Record<string, unknown>>,
): boolean =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([name, value]) => b[name] === value);

/**
 * Create a Relay environment whose store holds every recorded answer, and
 * which answers any request from the records too, so a component reading a
 * recorded node's fragments renders at once and makes no request a record
 * does not hold. A request with no record rejects.
 *
 * @returns The environment.
 */
export function createRecordedEnvironment(): Environment {
  const environment = createEnvironment({
    fetchFn: async (params, variables) => {
      const entry = networkResponses.find(
        (each) =>
          each.operation === params.name &&
          sameVariables(each.variables, variables),
      );
      if (entry === undefined) {
        throw new Error(`no recorded ${params.name}`);
      }
      return entry.response as GraphQLResponse;
    },
  });
  for (const { operation, variables, response } of networkResponses) {
    const node = OPERATIONS[operation];
    if (node === undefined) throw new Error(`no operation ${operation}`);
    environment.commitPayload(
      createOperationDescriptor(node, variables),
      response.data as never,
    );
  }
  return environment;
}

/** The node a recorded node query reads for `local`, from `environment`. */
const readRecordedNode = (
  environment: Environment,
  node: ConcreteRequest,
  local: string,
): unknown => {
  const operation = createOperationDescriptor(node, {
    id: `${METRO_NAMESPACE}${local}`,
  });
  return (environment.lookup(operation.fragment).data as { node?: unknown })
    ?.node;
};

/**
 * Read a recorded station's page view from `environment`, as the station
 * page shows it, its keys resolving in that environment.
 *
 * @param environment - An environment from `createRecordedEnvironment`.
 * @param local - The station's local name: `tannery-lane` or `northgate`.
 * @returns The view.
 * @throws When no answer is recorded for the station, or it is no station.
 */
export function readRecordedStation(
  environment: Environment,
  local: string,
): StationView {
  const node = readRecordedNode(environment, networkStationQueryNode, local);
  const view =
    node === undefined || node === null
      ? undefined
      : readStationView(node as NonNullable<NetworkStationQuery$data["node"]>);
  if (view === undefined) throw new Error(`${local} is no station`);
  return view;
}

/**
 * Read a recorded line's page view from `environment`, as the line page
 * shows it, its keys resolving in that environment.
 *
 * @param environment - An environment from `createRecordedEnvironment`.
 * @param local - The line's local name: `circle-line` or `north-line`.
 * @returns The view.
 * @throws When no answer is recorded for the line, or it is no line.
 */
export function readRecordedLine(
  environment: Environment,
  local: string,
): LineView {
  const node = readRecordedNode(environment, networkLineQueryNode, local);
  const view =
    node === undefined || node === null
      ? undefined
      : readLineView(node as NonNullable<NetworkLineQuery$data["node"]>);
  if (view === undefined) throw new Error(`${local} is no line`);
  return view;
}
