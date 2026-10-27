import { createConfig } from "@canonical/storybook-config";

export default createConfig("react", {
  // Wraps stories that declare `parameters.relay` in a relay-test-utils mock
  // environment, so the projections, which read their node through Relay,
  // render without a server.
  extraAddons: ["@canonical/storybook-addon-relay"],
});
