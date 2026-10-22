// @vitest-environment node

/**
 * The launcher's sequencing, driven through its real module: the process
 * boundary is stood in for (`spawn` returns a scriptable child, `fetch`
 * answers the readiness probe, `process.exit` throws so a run stops where
 * the launcher would), and each case imports the module afresh under its
 * own argv and environment.
 */

import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GRAPHQL_URL, GRAPHQL_URL_ENV_VAR } from "#graphql-endpoint";

/** A spawned child the test can drive: it records kills and emits events. */
class ChildStub extends EventEmitter {
  readonly kill = vi.fn<(signal?: NodeJS.Signals) => boolean>(() => true);
}

/** What one `spawn` call was asked to run. */
interface SpawnCall {
  readonly command: string;
  readonly args: readonly string[];
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly child: ChildStub;
}

const spawnCalls: SpawnCall[] = [];

vi.mock("node:child_process", () => ({
  spawn: (
    command: string,
    args: readonly string[],
    options: { readonly env: Record<string, string | undefined> },
  ) => {
    const child = new ChildStub();
    spawnCalls.push({ command, args, env: options.env, child });
    return child;
  },
}));

/** The error `process.exit` throws here, carrying the code it was given. */
class ExitSignal extends Error {
  constructor(readonly code: number | undefined) {
    super(`process.exit(${code})`);
  }
}

/** The signals the launcher forwards. */
const FORWARDED_SIGNALS = ["SIGINT", "SIGTERM"] as const;

/** The process, as the plain emitter its signal listeners live on. */
const processEmitter: EventEmitter = process;

/** The signal listeners present before a case, so a case removes only its
 * own. */
let signalListeners: ReadonlyMap<string, readonly unknown[]>;

/** Import the launcher afresh with `argv` after the script path. */
const launch = async (...argv: string[]): Promise<void> => {
  vi.resetModules();
  vi.spyOn(process, "argv", "get").mockReturnValue([
    "bun",
    "src/server/withGraph.ts",
    ...argv,
  ]);
  await import("./withGraph.js");
};

/** The spawn call at `index`, asserted present. */
const spawned = (index: number): SpawnCall => {
  const call = spawnCalls.at(index);
  if (call === undefined) {
    throw new Error(`no spawn call at ${index}`);
  }
  return call;
};

beforeEach(() => {
  spawnCalls.length = 0;
  signalListeners = new Map(
    FORWARDED_SIGNALS.map((signal) => [
      signal,
      processEmitter.listeners(signal),
    ]),
  );
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new ExitSignal(code === undefined ? undefined : Number(code));
  });
  vi.stubEnv(GRAPHQL_URL_ENV_VAR, "");
  vi.stubEnv("GRAPH_PORT", "");
  vi.stubEnv("GRAPH_READY_MS", "");
});

afterEach(() => {
  for (const signal of FORWARDED_SIGNALS) {
    const before = signalListeners.get(signal) ?? [];
    for (const listener of processEmitter.listeners(signal)) {
      if (!before.includes(listener)) {
        processEmitter.off(signal, listener as (...args: unknown[]) => void);
      }
    }
  }
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("withGraph", () => {
  it("exits with a usage error when no web command is given", async () => {
    await expect(launch()).rejects.toEqual(new ExitSignal(2));
    expect(spawnCalls).toEqual([]);
  });

  it("spawns no graph when an endpoint is configured, and hands it to the web command", async () => {
    vi.stubEnv(GRAPHQL_URL_ENV_VAR, "http://graph.example/graphql");
    await launch("vite", "--port", "5174");

    expect(spawnCalls).toHaveLength(1);
    const web = spawned(0);
    expect(web.command).toBe("vite");
    expect(web.args).toEqual(["--port", "5174"]);
    expect(web.env[GRAPHQL_URL_ENV_VAR]).toBe("http://graph.example/graphql");
    // The web command's exit code is the launcher's.
    expect(() => web.child.emit("exit", 3, null)).toThrow(new ExitSignal(3));
  });

  it("starts the graph, waits until it answers, then runs the web command against it", async () => {
    const probe = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", probe);
    vi.stubEnv("GRAPH_PORT", "6123");
    await launch("vite");

    const graph = spawned(0);
    expect(graph.command).toBe("bun");
    expect(graph.args).toEqual(["src/server/graph.ts"]);
    expect(graph.env.GRAPH_PORT).toBe("6123");
    const endpoint = new URL(DEFAULT_GRAPHQL_URL);
    endpoint.port = "6123";
    expect(probe).toHaveBeenCalledWith(endpoint.toString(), expect.anything());

    const web = spawned(1);
    expect(web.env[GRAPHQL_URL_ENV_VAR]).toBe(endpoint.toString());
    // A web command ended by a signal exits non-zero and takes the graph down.
    expect(() => web.child.emit("exit", null, "SIGTERM")).toThrow(
      new ExitSignal(1),
    );
    expect(graph.child.kill).toHaveBeenCalledWith("SIGTERM");
  });

  it("continues without the graph once its child exits before answering", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        spawned(0).child.emit("exit", 1);
        throw new Error("connection refused");
      }),
    );
    await launch("vite");

    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/exited \(code 1\) before it was ready/),
    );
    expect(spawned(1).command).toBe("vite");
  });

  it("continues without the graph once its child cannot be started", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        spawned(0).child.emit("error", new Error("bun not found"));
        return new Response("{}", { status: 503 });
      }),
    );
    await launch("vite");

    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/could not be started \(bun not found\)/),
    );
    expect(spawned(1).command).toBe("vite");
  });

  it("gives up on a graph that never answers within the budget", async () => {
    vi.stubEnv("GRAPH_READY_MS", "1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 503 })),
    );
    await launch("vite");

    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/did not answer .* within 1ms/),
    );
    expect(spawned(1).command).toBe("vite");
  });

  it("takes the graph down when the web command cannot start", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    await launch("vite");

    expect(() =>
      spawned(1).child.emit("error", new Error("vite not found")),
    ).toThrow(new ExitSignal(1));
    expect(spawned(0).child.kill).toHaveBeenCalledWith("SIGTERM");
  });

  it("forwards a signal to both children", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    await launch("vite");

    process.emit("SIGTERM", "SIGTERM");

    expect(spawned(0).child.kill).toHaveBeenCalledWith("SIGTERM");
    expect(spawned(1).child.kill).toHaveBeenCalledWith("SIGTERM");
  });

  it("ends the launcher on a signal that arrives before the web command exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        expect(() => process.emit("SIGINT", "SIGINT")).toThrow(
          new ExitSignal(1),
        );
        return new Response("{}", { status: 200 });
      }),
    );
    await launch("vite");

    expect(spawned(0).child.kill).toHaveBeenCalledWith("SIGINT");
  });
});
