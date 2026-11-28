import adapter from "@sveltejs/adapter-node";
import staticAdapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit:
    process.env.APP_SPA === "1"
      ? {
          adapter: staticAdapter({
            fallback: "200.html",
            pages: "build-spa",
            assets: "build-spa",
          }),
          files: {
            routes: "src/spa/routes",
            appTemplate: "src/spa/app.html",
            hooks: {
              client: "src/spa/hooks.client",
              server: "src/spa/hooks.server",
            },
          },
        }
      : { adapter: adapter() },
};
