const WRAPPERS: ReadonlySet<string> = new Set([
  "memo",
  "forwardRef",
  "React.memo",
  "React.forwardRef",
]);

/** Whether a callee wraps a component: `memo` or `forwardRef`, bare or on `React`. */
export default function isWrapperCallee(callee: string): boolean {
  return WRAPPERS.has(callee);
}
