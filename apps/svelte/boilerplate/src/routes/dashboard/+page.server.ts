import type { PageServerLoad } from "./$types";
import { readSettings } from "../../domains/dashboard/settings";
import { readInstances } from "../../domains/dashboard/instances";

export const load: PageServerLoad = ({ cookies }) => {
  return { name: readSettings(cookies.get("demo-settings")).name, count: readInstances(cookies.get("demo-instances")).length };
};
