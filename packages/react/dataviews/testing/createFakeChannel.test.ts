import { describe, expect, it, vi } from "vitest";
import createFakeChannel from "./createFakeChannel.js";

describe("createFakeChannel", () => {
  it("reads the value it was last set to", () => {
    const channel = createFakeChannel(1);
    expect(channel.get()).toBe(1);
    channel.set(2);
    expect(channel.get()).toBe(2);
  });

  it("notifies each listener of a change until it unsubscribes", () => {
    const channel = createFakeChannel("a");
    const listener = vi.fn();
    const unsubscribe = channel.subscribe(listener);
    channel.set("b");
    unsubscribe();
    channel.set("c");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies nobody of a set the guard calls equal", () => {
    const channel = createFakeChannel(
      { count: 1 },
      (a, b) => a.count === b.count,
    );
    const listener = vi.fn();
    channel.subscribe(listener);
    channel.set({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it("calls two values equal by Object.is unless given a guard", () => {
    const channel = createFakeChannel(Number.NaN);
    const listener = vi.fn();
    channel.subscribe(listener);
    channel.set(Number.NaN);
    channel.set(-0);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies every listener subscribed when the change began", () => {
    const channel = createFakeChannel(0);
    const later = vi.fn();
    let unsubscribeLater = () => {};
    channel.subscribe(() => {
      unsubscribeLater();
    });
    unsubscribeLater = channel.subscribe(later);
    channel.set(1);
    expect(later).toHaveBeenCalledTimes(1);
  });
});
