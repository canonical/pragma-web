import { fail } from "@sveltejs/kit";
import { decode, validate } from "../../domains/contact/form";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request }) => {
    const values = decode(await request.formData());
    const errors = validate(values);
    if (Object.keys(errors).length) return fail(400, { values, errors });
    // This reference has no delivery service; an actual host owns the mutation.
    return { success: true };
  },
};
