/**
 * Make this Node process read as a browser page's, one with no Node
 * version, until the returned restore runs.
 *
 * `import stubBrowserProcess from "./stubBrowserProcess.js";`
 *
 * @returns The restore, which puts the Node version back.
 * @note Impure: replaces `process.versions` until restored.
 */
export default function stubBrowserProcess(): () => void {
  const versions = process.versions;
  Object.defineProperty(process, "versions", {
    configurable: true,
    value: { ...versions, node: undefined },
  });
  return () => {
    Object.defineProperty(process, "versions", {
      configurable: true,
      value: versions,
    });
  };
}
