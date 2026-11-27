import { json } from "@sveltejs/kit";
import { isNameTaken, readInstances } from "../../../domains/dashboard/instances";
import type { RequestHandler } from "./$types";

// Answers the create form's remote check: 200 when the name is free, 409 with a message key when taken.
// The create action checks again, since a check needs JavaScript and can be skipped.
export const POST: RequestHandler = async ({ request, cookies }) => {
  const body: unknown = await request.json().catch(() => undefined);
  const value = body && typeof body === "object" && "value" in body ? body.value : undefined;
  if (typeof value !== "string" || value.length > 100) return json({ error: "instanceInvalid" }, { status: 400 });
  if (isNameTaken(value, readInstances(cookies.get("demo-instances")))) return json({ error: "instanceDuplicate" }, { status: 409 });
  return json({});
};
