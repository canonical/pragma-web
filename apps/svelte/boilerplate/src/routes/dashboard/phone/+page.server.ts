import { fail } from "@sveltejs/kit";
import { readPhone } from "../../../domains/dashboard/phone";
import type { Actions } from "./$types";
export const actions: Actions = {
  default: async ({ request }) => {
    const phone = readPhone(await request.formData());
    return phone ? { phone } : fail(400, { phone });
  },
};
