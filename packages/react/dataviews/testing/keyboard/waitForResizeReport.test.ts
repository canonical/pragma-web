import type { Locator } from "playwright/test";
import { describe, expect, it, onTestFinished } from "vitest";
import { installResizeObserverStandIn } from "../index.js";
import waitForResizeReport from "./waitForResizeReport.js";

describe("waitForResizeReport", () => {
  it("resolves once the element's size is reported, and stops observing", async () => {
    const standIn = installResizeObserverStandIn();
    onTestFinished(standIn.uninstall);
    const element = document.createElement("div");
    let reported = false;
    const locator = {
      evaluate: async (run: (element: Element) => Promise<void>) => {
        const waiting = run(element).then(() => {
          reported = true;
        });
        expect(standIn.observing(element)).toBe(1);
        expect(reported).toBe(false);
        standIn.resize(element, 120);
        await waiting;
      },
    };
    await waitForResizeReport(locator as unknown as Locator);
    expect(reported).toBe(true);
    expect(standIn.observing(element)).toBe(0);
  });
});
