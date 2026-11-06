import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createConfig } from "@canonical/storybook-config";

function getAddonPath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/manager`)));
}

// The server-backed stories declare their endpoints as the MSW addon's
// `parameters.msw.handlers`, as they do in the hub Storybook. The addon serves
// its Mock Service Worker script beside the preview and installs a story's
// handlers in a loader, before the story first renders, replacing the last
// story's. It mounts every story once, so a play function acts on the story
// that stays on screen.
export default createConfig("react", {
  extraAddons: [getAddonPath("@canonical/storybook-addon-msw")],
});
