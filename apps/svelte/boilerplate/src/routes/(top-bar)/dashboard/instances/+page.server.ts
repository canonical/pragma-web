import { fail } from "@sveltejs/kit";
import createInstance from "../../../../domains/dashboard/createInstance.js";
import type { Actions } from "./$types";

/**
 * The create form's fallback without JavaScript: the new instance is added to
 * this response only, as the React page keeps it in memory only. With
 * JavaScript the page handles the submit itself.
 */
export const actions: Actions = {
  create: async ({ request }) => {
    const created = createInstance(
      Object.fromEntries(await request.formData()),
    );

    if (!created) {
      return fail(400, {
        nameError: "dashboard.instances.nameRequired" as const,
      });
    }

    return { created };
  },
};
