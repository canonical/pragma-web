/**
 * The shared test constants: how a test waits on a delivery, the fields
 * whose facets the chart tests ask for, and where the mock API is addressed.
 */

/**
 * How a test waits on a delivery: often, since one arrives within a round
 * trip, and long enough for a busy machine, within the test's own timeout.
 */
export const DELIVERY_WAIT = { interval: 5, timeout: 4000 } as const;

/** The fields whose facets the chart tests ask for. */
export const CHART_FACETS = ["status", "cores"] as const;

/** Where a test's mock API requests are addressed; the handlers match any origin. */
export const MOCK_API_ORIGIN = "http://localhost";
