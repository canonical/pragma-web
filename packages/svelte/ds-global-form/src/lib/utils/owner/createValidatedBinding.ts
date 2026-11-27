import { SvelteMap } from "svelte/reactivity";
import runLatest from "./runLatest.js";
import type {
  FieldValidator,
  FormValues,
  ResettableOwner,
  ValidatedOwner,
} from "./types.js";

type Runner = ReturnType<typeof runLatest<unknown, string | undefined>>;

/**
 * Adds asynchronous field checks to an owner, such as a server lookup. Every
 * write to a checked field starts its check; the field keeps its previous
 * message until the check settles. Only the latest check of a field counts,
 * and `reset` cancels them all. A check that fails (for example offline)
 * keeps the previous message, as React's `addRESTValidation` does. The
 * checks' messages come before the owner's own errors, and a submit with a
 * message showing is stopped before it reaches the owner. A submit does not
 * wait for running checks: call `validate()` for that.
 * @note Pure: the returned owner holds the checks' messages and runs.
 */
export default function createValidatedBinding<Values extends FormValues>(
  owner: ResettableOwner<Values>,
  validators: {
    [Name in keyof Values & string]?: FieldValidator<Values[Name]>;
  },
): ValidatedOwner<Values> {
  const messages = new SvelteMap<string, string>();
  const pending = new Map<string, Promise<void>>();
  const runners = new Map<string, Runner>(
    Object.entries(validators).map(([name, validator]) => [
      name,
      runLatest(validator as FieldValidator<unknown>),
    ]),
  );

  /** Checks the field's new value; its message changes when the check is done. */
  function startValidation(name: string, value: unknown): void {
    const runner = runners.get(name);
    if (!runner) return;
    const run = runner.run(value).then((outcome) => {
      if (outcome.status === "done") {
        if (outcome.value === undefined) messages.delete(name);
        else messages.set(name, outcome.value);
      }
      if (pending.get(name) === run) pending.delete(name);
    });
    pending.set(name, run);
  }

  const getError = (name: keyof Values & string) =>
    messages.get(name) ?? owner.getError?.(name);

  return {
    get values() {
      return owner.values;
    },
    setValue(name, value) {
      owner.setValue(name, value);
      startValidation(name, value);
    },
    getError,
    blur: owner.blur?.bind(owner),
    submit(event) {
      if (messages.size > 0) event.preventDefault();
      else owner.submit?.(event);
    },
    reset() {
      for (const runner of runners.values()) runner.cancel();
      pending.clear();
      messages.clear();
      owner.reset();
    },
    async validate() {
      for (const name of runners.keys())
        startValidation(name, owner.values[name]);
      while (pending.size > 0) await Promise.all(pending.values());
      return [...runners.keys()].every((name) => getError(name) === undefined);
    },
  };
}
