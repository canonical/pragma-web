/**
 * The demo authentication guard, in one place for both callers: the route
 * middleware the client navigates through, and the HTTP entry points that have
 * to answer before a renderer exists.
 *
 * Not barrelled from `#lib/ui`: nothing here renders. Import from
 * `#lib/authGuard`.
 */

export { getAuthRedirectHref, withAuth } from "./authGuard.js";
