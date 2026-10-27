import type { ElementType, ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { Environment } from "relay-runtime";

/**
 * Storybook decorator that renders a story in a given Relay environment in
 * place of the Relay addon's mock one: for a story whose args already hold
 * fragment keys read from that environment's store, such as the network
 * lens's recorded views.
 *
 * @param environment - The environment the story's keys resolve in.
 * @returns The decorator.
 *
 * @example
 * ```ts
 * decorators: [withEnvironment(RECORDED), withProjections(), withRouter()]
 * ```
 */
const withEnvironment =
  (environment: Environment) =>
  (Story: ElementType): ReactElement => (
    <RelayEnvironmentProvider environment={environment}>
      <Story />
    </RelayEnvironmentProvider>
  );

export default withEnvironment;
