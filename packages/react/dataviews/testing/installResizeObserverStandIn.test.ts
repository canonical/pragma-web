import { afterEach, describe, expect, it, vi } from "vitest";
import installResizeObserverStandIn from "./installResizeObserverStandIn.js";
import type { ResizeObserverStandIn } from "./types.js";

describe("installResizeObserverStandIn", () => {
  let standIn: ResizeObserverStandIn;
  const original = globalThis.ResizeObserver;

  afterEach(() => {
    standIn.uninstall();
  });

  it("reports a resize to the observers of that element only", () => {
    standIn = installResizeObserverStandIn();
    const element = document.createElement("div");
    const other = document.createElement("div");
    const heard = vi.fn<ResizeObserverCallback>();
    const observer = new ResizeObserver(heard);
    observer.observe(element);
    standIn.resize(other, 100);
    expect(heard).not.toHaveBeenCalled();
    standIn.resize(element, 320);
    expect(heard).toHaveBeenCalledOnce();
    const [entries, by] = heard.mock.calls.at(0) ?? [[]];
    const [entry] = entries;
    expect(by).toBe(observer);
    expect(entry?.target).toBe(element);
    expect(entry?.contentRect.width).toBe(320);
    expect(entry?.contentBoxSize.at(0)?.inlineSize).toBe(320);
    expect(entry?.borderBoxSize.at(0)?.blockSize).toBe(0);
  });

  it("reports a block size when one is given", () => {
    standIn = installResizeObserverStandIn();
    const element = document.createElement("div");
    const heard = vi.fn<ResizeObserverCallback>();
    new ResizeObserver(heard).observe(element);
    standIn.resize(element, 320, 48);
    const [entries] = heard.mock.calls.at(0) ?? [[]];
    expect(entries.at(0)?.borderBoxSize.at(0)?.blockSize).toBe(48);
    expect(entries.at(0)?.contentRect.height).toBe(48);
  });

  it("reports nothing once unobserved or disconnected", () => {
    standIn = installResizeObserverStandIn();
    const element = document.createElement("div");
    const heard = vi.fn();
    const observer = new ResizeObserver(heard);
    observer.observe(element);
    expect(standIn.observing(element)).toBe(1);
    observer.unobserve(element);
    expect(standIn.observing(element)).toBe(0);
    standIn.resize(element, 320);
    observer.observe(element);
    observer.disconnect();
    standIn.resize(element, 320);
    expect(heard).not.toHaveBeenCalled();
  });

  it("restores the observer it replaced", () => {
    standIn = installResizeObserverStandIn();
    expect(globalThis.ResizeObserver).not.toBe(original);
    standIn.uninstall();
    expect(globalThis.ResizeObserver).toBe(original);
  });
});
