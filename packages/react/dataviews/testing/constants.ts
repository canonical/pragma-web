/** Shared test constants. */

/** The fields whose facets the chart tests ask for. */
export const CHART_FACETS = ["status", "cores"] as const;

/** Where a test's mock API requests are addressed; the handlers match any origin. */
export const MOCK_API_ORIGIN = "http://localhost";
