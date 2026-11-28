import previewConfig from "@canonical/storybook-config/preview";
import "../src/styles/index.css";
import * as decorators from "../src/storybook/decorators";

export default {
  ...previewConfig,
  // Every story renders inside the app's locale source, so translated components work in isolation.
  decorators: [decorators.withI18n()],
  globalTypes: {
    locale: {
      description: "Language",
      toolbar: { title: "Language", items: ["en", "fr", "ar"] },
    },
  },
  initialGlobals: { locale: "en" },
};
