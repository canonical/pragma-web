import { fail } from "@sveltejs/kit";
import {
  readContact,
  validateContact,
} from "../../../../domains/contact/validateContact.js";
import type { Actions } from "./$types";

/**
 * The form's fallback without JavaScript: it validates as the page does and
 * redisplays the values. With JavaScript the page handles the submit itself.
 */
export const actions: Actions = {
  default: async ({ request }) => {
    const values = readContact(await request.formData());
    const errors = validateContact(values);

    if (Object.keys(errors).length > 0) {
      return fail(400, { values, errors });
    }

    return { values };
  },
};
