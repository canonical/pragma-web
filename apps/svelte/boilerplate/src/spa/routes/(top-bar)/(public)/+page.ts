import createDelayedData from "../../../../lib/LazyComponent/createDelayedData.js";
import type { PageLoad } from "./$types";

// Without a server there is nothing to stream: the page renders the fallback
// until the promise resolves in the browser.
export const load: PageLoad = () => ({ streamed: createDelayedData() });
