import { describe, expect, it } from "vitest";
import createRecordingLocation from "./createRecordingLocation.js";

describe("createRecordingLocation", () => {
  it("records each write with its history mode", () => {
    const recording = createRecordingLocation();
    recording.location.write(new URLSearchParams("q=a"));
    recording.location.write(new URLSearchParams("q=b"), { history: "push" });
    expect(recording.writes).toEqual([
      ["q=a", null],
      ["q=b", "push"],
    ]);
    expect(recording.location.read().toString()).toBe("q=b");
  });

  it("records what a subscriber was told, and stops when it leaves", () => {
    const recording = createRecordingLocation({ href: "http://local/?q=a" });
    const heard: string[] = [];
    const leave = recording.location.subscribe(() =>
      heard.push(recording.location.read().toString()),
    );
    recording.move("q=b");
    leave();
    recording.move("q=c");
    expect(heard).toEqual(["q=b"]);
    expect(recording.notifications).toEqual(["q=b"]);
  });

  it("counts its reads and subscriptions", () => {
    const recording = createRecordingLocation();
    expect(recording.countReads()).toBe(0);
    recording.location.read();
    recording.location.subscribe(() => {});
    expect(recording.countReads()).toBe(1);
    expect(recording.countSubscriptions()).toBe(1);
  });
});
