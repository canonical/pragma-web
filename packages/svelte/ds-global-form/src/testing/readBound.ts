/** Reads the value printed by the Bound fixture. */
export default function readBound(container: HTMLElement): unknown {
  return JSON.parse(
    container.querySelector('[data-testid="bound"]')?.textContent ?? "null",
  );
}
