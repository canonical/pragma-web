import { readInstances } from "../../domains/dashboard/instances";
import { readSettings } from "../../domains/dashboard/settings";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies }) => {
  return {
    name: readSettings(cookies.get("demo-settings")).name,
    count: readInstances(cookies.get("demo-instances")).length,
  };
};
