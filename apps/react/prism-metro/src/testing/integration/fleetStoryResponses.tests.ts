// @vitest-environment node

import { describe, expect, it } from "vitest";
import { FLEET_RESPONSES } from "../../../.storybook/mocks/fleetResponses.js";
import createMetroExecute from "../../../testing/createMetroExecute.js";

/** Every compiled operation of the app, by name, for its text. */
const ARTIFACTS = import.meta.glob<{
  readonly default: { readonly params: { readonly text: string } };
}>("../../relay/__generated__/*.graphql.ts", { eager: true });

/** Read an operation's text off its compiled artifact. */
const readOperationText = (name: string): string => {
  const artifact = ARTIFACTS[`../../relay/__generated__/${name}.graphql.ts`];
  if (artifact === undefined) throw new Error(`${name} is not compiled`);
  return artifact.default.params.text;
};

describe("the fleet stories' recorded answers", () => {
  it.each(FLEET_RESPONSES)(
    "$operation still answers as the metro provider does",
    async ({ operation, variables, response }) => {
      const execute = createMetroExecute();
      const live = await execute(readOperationText(operation), variables);
      expect(JSON.parse(JSON.stringify(live))).toEqual(response);
    },
  );
});
