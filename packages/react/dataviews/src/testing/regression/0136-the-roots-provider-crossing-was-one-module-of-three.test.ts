/**
 * The crossing between a root's context and its caller's types was one
 * module of three named exports beside the root's components, where every
 * helper of the root is a module of one default export under its `utils`,
 * each with its test.
 *
 * Each conversion is its own module there.
 */

import { describe, expect, it } from "vitest";
import * as narrowRootFilters from "../../lib/_work_in_progress/DataViews/common/utils/narrowRootFilters.js";
import * as narrowRootProvider from "../../lib/_work_in_progress/DataViews/common/utils/narrowRootProvider.js";
import * as widenRootProvider from "../../lib/_work_in_progress/DataViews/common/utils/widenRootProvider.js";

describe("the root's provider crossing", () => {
  it("is three modules of one default export each", () => {
    for (const module of [
      narrowRootFilters,
      narrowRootProvider,
      widenRootProvider,
    ]) {
      expect(Object.keys(module)).toEqual(["default"]);
      expect(module.default).toBeTypeOf("function");
    }
  });
});
