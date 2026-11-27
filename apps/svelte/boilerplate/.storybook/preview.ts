import previewConfig from "@canonical/storybook-config/preview";
import "../src/styles.css";

export default {
  ...previewConfig,
  globalTypes: {
    locale: { description: "Language", toolbar: { title: "Language", items: ["en", "fr", "ar"] } },
  },
  initialGlobals: { locale: "en" },
};
