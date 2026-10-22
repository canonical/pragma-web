import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";

/**
 * A spawned server under test.
 */
export interface RunningServer {
  /** Base URL, e.g. `http://localhost:54123`. */
  readonly base: string;
  /** Stop the server and its whole process group. */
  readonly stop: () => Promise<void>;
}

/** Options for `startServer`. */
export interface StartServerOptions {
  /** How long the server may take to answer its first request. */
  readonly timeoutMs?: number;
  /** Extra environment variables for the script. */
  readonly env?: Readonly<Record<string, string>>;
  /** The variable the script reads its port from. */
  readonly portEnv?: string;
  /**
   * The host the server is probed and addressed on. A server bound to the
   * IPv4 loopback alone must be probed at `127.0.0.1`, because `localhost`
   * may resolve to `::1` first.
   */
  readonly hostname?: string;
}

/**
 * Reserve a free TCP port by opening an ephemeral listener and reading it
 * back.
 *
 * @returns The port.
 * @note Impure: opens and closes a socket.
 */
export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on("error", reject);
    srv.listen(0, () => {
      const address = srv.address();
      if (address && typeof address === "object") {
        const { port } = address;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error("could not determine a free port")));
      }
    });
  });
}

/**
 * Resolve once the server answers an HTTP request at `base`, or reject after
 * `timeoutMs`. Any response, even a 404, means the server is up.
 *
 * @note Impure: performs network requests.
 */
async function waitForServer(
  base: string,
  timeoutMs: number,
  startedAt: number,
): Promise<void> {
  const deadline = startedAt + timeoutMs;
  for (;;) {
    try {
      await fetch(`${base}/`, { signal: AbortSignal.timeout(1000) });
      return;
    } catch {
      if (Date.now() > deadline) {
        throw new Error(`${base} did not respond within ${timeoutMs}ms`);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
  }
}

/**
 * Spawn a package script in `cwd` on a fresh OS-assigned port, wait until it
 * answers, and return a handle that tears down the whole process group.
 *
 * - The port is OS-assigned and handed over in `portEnv`, so no two servers
 *   collide.
 * - Readiness is polled over HTTP, not slept, which tolerates Vite's first
 *   boot and the preview build.
 * - The child is spawned detached and killed by process group, so no server
 *   is left holding its port.
 *
 * @param script - The package script to run.
 * @param cwd - The package directory.
 * @param options - The readiness budget, extra environment, port variable
 *   and host.
 * @returns The running server.
 * @note Impure: spawns a process and performs network requests.
 */
export async function startServer(
  script: string,
  cwd: string,
  {
    timeoutMs = 180_000,
    env = {},
    portEnv = "PORT",
    hostname = "localhost",
  }: StartServerOptions = {},
): Promise<RunningServer> {
  const port = await getFreePort();
  const base = `http://${hostname}:${port}`;
  // Capture stderr so a boot crash surfaces the real cause instead of an
  // opaque readiness timeout.
  const child: ChildProcess = spawn("bun", ["run", script], {
    cwd,
    env: { ...process.env, ...env, [portEnv]: String(port) },
    detached: true,
    stdio: ["ignore", "ignore", "pipe"],
  });

  let stderrTail = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderrTail = (stderrTail + chunk.toString()).slice(-4000);
  });

  // Reject readiness at once if the child exits before it serves. Guarded so
  // the exit `stop()` causes after readiness is ignored.
  let ready = false;
  const exited = new Promise<never>((_, reject) => {
    child.once("exit", (code) => {
      if (ready) return;
      reject(
        new Error(
          `\`${script}\` exited early (code ${code}) before serving.\n${stderrTail}`,
        ),
      );
    });
  });

  const stop = (): Promise<void> =>
    new Promise((resolve) => {
      const { pid } = child;
      if (pid == null || child.exitCode != null) {
        resolve();
        return;
      }
      child.once("exit", () => resolve());
      try {
        if (process.platform === "win32") {
          // A process-group kill is POSIX-only; `taskkill /T` ends the child
          // and its descendants instead.
          spawn("taskkill", ["/pid", String(pid), "/T", "/F"], {
            stdio: "ignore",
          });
        } else {
          // A negative PID kills the whole process group: the script and the
          // server it spawns.
          process.kill(-pid, "SIGKILL");
        }
      } catch {
        resolve();
      }
    });

  try {
    await Promise.race([waitForServer(base, timeoutMs, Date.now()), exited]);
    ready = true;
  } catch (error) {
    await stop();
    throw error;
  }

  // The now-irrelevant rejection is handled so it is not unhandled.
  exited.catch(() => {});

  return { base, stop };
}
