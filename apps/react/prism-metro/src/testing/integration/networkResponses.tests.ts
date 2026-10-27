// @vitest-environment node

import { describe, expect, it } from "vitest";
import networkLineQueryNode from "#relay/__generated__/NetworkLineQuery.graphql.js";
import networkMapQueryNode from "#relay/__generated__/NetworkMapQuery.graphql.js";
import networkNamespacesQueryNode from "#relay/__generated__/NetworkNamespacesQuery.graphql.js";
import networkStationQueryNode from "#relay/__generated__/NetworkStationQuery.graphql.js";
import createMetroExecute from "../../../testing/createMetroExecute.js";
import networkResponses from "../../../testing/records/networkResponses.js";

/** The operation text of each network operation, by name. */
const TEXTS = new Map(
  [
    networkNamespacesQueryNode,
    networkMapQueryNode,
    networkStationQueryNode,
    networkLineQueryNode,
  ].map((node) => [node.params.name, node.params.text as string]),
);

describe("the network lens's recorded answers", () => {
  it.each(networkResponses)(
    "$operation at $variables matches the metro provider",
    async ({ operation, variables, response }) => {
      const text = TEXTS.get(operation);
      expect(text).toBeDefined();
      const answer = await createMetroExecute()(text as string, variables);
      expect(JSON.parse(JSON.stringify(answer))).toEqual(response);
    },
  );
});
