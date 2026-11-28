import createDelayedData from "../../../lib/LazyComponent/createDelayedData.js";
import type { PageServerLoad } from "./$types";

// The promise is returned without awaiting it, so SvelteKit streams it: the
// page renders with the fallback, and the value follows in the same response.
export const load: PageServerLoad = () => ({ streamed: createDelayedData() });
