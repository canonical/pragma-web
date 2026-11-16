/**
 * Keeps chaining active while any tooltip is visible and for a grace period after the last one closes.
 */
export class ChainingManager {
  readonly #chainingThreshold: number;
  #activeCount = 0;
  #chainingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    /**
     * The duration (in milliseconds) for which chaining remains active after the last tooltip closes.
     */
    chainingThreshold: number,
  ) {
    this.#chainingThreshold = chainingThreshold;
  }

  get chaining() {
    return this.#activeCount > 0 || this.#chainingTimeout !== null;
  }

  /**
   * Registers a component as participating in chaining and starts the chaining cooldown once last element releases.
   * @note - This function is impure - it modifies the classes attributes.
   */
  acquire(): () => void {
    if (this.#chainingTimeout !== null) {
      clearTimeout(this.#chainingTimeout);
      this.#chainingTimeout = null;
    }

    this.#activeCount += 1;

    let released = false;

    return () => {
      if (released) return;
      released = true;

      this.#activeCount -= 1;

      if (this.#activeCount === 0) {
        this.#chainingTimeout = setTimeout(() => {
          this.#chainingTimeout = null;
        }, this.#chainingThreshold);
      }
    };
  }
}
