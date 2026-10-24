import { route } from "@canonical/router-core";
import { PlaygroundPage } from "./lib/PlaygroundPage/index.js";
import warmPlayground from "./warmPlayground.js";

const routes = {
  playground: route({
    url: "/playground",
    content: () => <PlaygroundPage />,
    // The probe's data reaches the store through `warmPlayground`: the
    // server's prepare step awaits it and serialises the resulting store
    // into `__INITIAL_DATA__.relay.records` (see
    // src/server/prepareRelayData.ts); in the browser it does nothing when
    // the store already holds the data.
    warm: warmPlayground,
  }),
} as const;

export default routes;
