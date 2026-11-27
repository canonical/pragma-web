import { json } from "@sveltejs/kit";
import { releaseOptions } from "../../../domains/dashboard/instances";
import type { RequestHandler } from "./$types";

// The options of the create form's release field, read by its `load` with `fetchOptions`.
export const GET: RequestHandler = () => json(releaseOptions);
