/**
 * Handlers the tests serve, one per route, each answering with an empty
 * list.
 */

import { HttpResponse, http } from "msw";

/** Answers `GET /api/options`. */
export const options = http.get("/api/options", () => HttpResponse.json([]));

/** Answers `GET /api/validate`. */
export const validation = http.get("/api/validate", () =>
  HttpResponse.json([]),
);

/** Answers `GET /api/machines`. */
export const machines = http.get("/api/machines", () => HttpResponse.json([]));
