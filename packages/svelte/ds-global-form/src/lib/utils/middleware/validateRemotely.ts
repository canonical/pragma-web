import type { Attachment } from "svelte/attachments";
import { VALIDITY_EVENT } from "../../common/constants.js";
import runLatest from "../owner/runLatest.js";
import type {
  RESTValidationOptions,
  RemoteCheck,
  RemoteValidationOptions,
  ValidatedControl,
} from "./types.js";

/** The message shown when the endpoint rejects a value without a readable one. */
const DEFAULT_ERROR_MESSAGE = "Validation failed";

/**
 * The messages each `validateRemotely` instance set on a control, by instance.
 * A control has one custom validity, so it shows the first of them, and each
 * instance clears only its own.
 */
const messagesByControl = new WeakMap<ValidatedControl, Map<symbol, string>>();

/**
 * The instances detached from a control in this task, whose messages wait for
 * a new instance to adopt them: an attachment that re-runs keeps its message
 * instead of clearing it until the next answer.
 */
const orphansByControl = new WeakMap<ValidatedControl, symbol[]>();

/** Returns the messages set on a control, by instance. */
function readMessages(control: ValidatedControl): Map<symbol, string> {
  let messages = messagesByControl.get(control);
  if (!messages) {
    messages = new Map();
    messagesByControl.set(control, messages);
  }
  return messages;
}

/**
 * Sets or clears one instance's message, and shows the first message left as
 * the control's custom validity. Setting asks the control to check itself, so
 * its `invalid` event reaches the field; clearing fires no event of its own, so
 * it dispatches `ds:validity` for the field to read the validity again.
 * @note Impure: writes the control's custom validity and dispatches an event.
 */
function writeMessage(
  control: ValidatedControl,
  key: symbol,
  message: string | undefined,
): void {
  const messages = readMessages(control);
  if (message === undefined) messages.delete(key);
  else messages.set(key, message);
  control.setCustomValidity([...messages.values()].at(0) ?? "");
  if (message === undefined) {
    control.dispatchEvent(new Event(VALIDITY_EVENT, { bubbles: true }));
  } else {
    control.checkValidity();
  }
}

/**
 * Resolves after `ms` milliseconds, or rejects when the signal aborts first.
 * @note Impure: schedules a timer.
 */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/**
 * Runs a check, aborting it and rejecting after `timeout` milliseconds, or
 * when the signal aborts.
 * @note Impure: schedules a timer.
 */
function runWithTimeout(
  check: RemoteCheck,
  value: string,
  signal: AbortSignal,
  timeout: number,
): Promise<string | undefined> {
  const controller = new AbortController();
  return new Promise<string | undefined>((resolve, reject) => {
    // Settles as soon as the check is superseded or times out, even when the
    // check ignores its signal.
    const stop = (reason: unknown) => {
      controller.abort();
      reject(reason);
    };
    const supersede = () => stop(signal.reason);
    const timer = setTimeout(
      () => stop(new Error("The check timed out")),
      timeout,
    );
    signal.addEventListener("abort", supersede, { once: true });
    check(value, controller.signal)
      .then(resolve, reject)
      .finally(() => {
        clearTimeout(timer);
        signal.removeEventListener("abort", supersede);
      });
  });
}

/**
 * Reads the message of a rejecting response, falling back to the default when
 * `errorExtractor` cannot read it, so the value still shows as rejected.
 */
async function readErrorMessage(
  response: Response,
  errorExtractor: NonNullable<RESTValidationOptions["errorExtractor"]>,
): Promise<string> {
  try {
    return await errorExtractor(response);
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
}

/**
 * Builds a check that sends the value to a REST endpoint: an OK response
 * means valid, any other response carries the message, and a request that
 * fails to complete rejects, which means no answer.
 * @note Pure: the returned check performs network requests.
 */
function createRESTCheck(
  url: string,
  {
    method = "POST",
    headers = { "Content-Type": "application/json" },
    bodyFormatter = (value: string) => ({ value }),
    errorExtractor = () => DEFAULT_ERROR_MESSAGE,
  }: RESTValidationOptions,
): RemoteCheck {
  return async (value, signal) => {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(bodyFormatter(value)),
      signal,
    });
    return response.ok ? undefined : readErrorMessage(response, errorExtractor);
  };
}

/** The latest value checked, and whether its check got an answer. */
type CheckedValue = {
  value: string;
  settled: Promise<void>;
  isAnswered: boolean;
};

/**
 * Checks a control's value remotely once the user stops typing, and sets the
 * answer as the control's custom validity, so the browser blocks a submit and
 * `Field` shows the message. Pass it with `{@attach}` to a field or input:
 *
 * ```svelte
 * <Field inputType="text" name="username" label="Username"
 *   {@attach validateRemotely("/api/validate-username")} />
 * ```
 *
 * The first argument is a REST endpoint, or your own check: a function of the
 * value and an abort signal that resolves to a message, or `undefined` when
 * the value is valid. Each change cancels the pending timer and aborts the
 * check in flight, so only the answer for the latest value can set or clear
 * the message. A check that fails to complete, or is still unanswered after
 * `timeout`, keeps the previous message. Values shorter than `minLength` are
 * not checked and clear the message. Each instance clears only the message it
 * set. A submit of a value not checked yet waits for its check, then submits
 * again if the value passed. In a form with `novalidate`, a rejected value
 * still blocks the submit.
 *
 * Only string values are checked, read from the control: the value a user
 * typed or picked. A value written by code without an `input` or `change`
 * event is checked on submit. Without JavaScript nothing is checked, so
 * validate on the server too.
 *
 * @param target - The endpoint validating the value, or a check.
 * @param options - Request, debounce and timeout options; the request options
 * apply to an endpoint only.
 * @returns An attachment for a text-like input, textarea or select.
 */
export default function validateRemotely(
  target: string | RemoteCheck,
  options: RESTValidationOptions = {},
): Attachment<ValidatedControl> {
  const check =
    typeof target === "string" ? createRESTCheck(target, options) : target;
  const {
    minLength = 3,
    debounceWait = 300,
    timeout = 10000,
  }: RemoteValidationOptions = options;

  return (control) => {
    const runner = runLatest(async (value: string, signal: AbortSignal) => {
      await wait(debounceWait, signal);
      return runWithTimeout(check, value, signal, timeout);
    });
    const key = orphansByControl.get(control)?.shift() ?? Symbol("check");
    const messages = readMessages(control);
    let checked: CheckedValue | undefined;
    let isResubmitting = false;
    let isHolding = false;

    /** Checks a value, unless it is the value already checked or being checked. */
    const follow = (value: string): Promise<void> => {
      if (checked?.value === value) return checked.settled;
      if (value.length < minLength) {
        runner.cancel();
        checked = undefined;
        if (messages.has(key)) writeMessage(control, key, undefined);
        return Promise.resolve();
      }
      const current: CheckedValue = {
        value,
        isAnswered: false,
        settled: runner.run(value).then((outcome) => {
          if (outcome.status === "superseded") return;
          if (outcome.status === "failed") {
            // No answer: keep the previous message, and ask again next time.
            // A failed check is always the latest: a newer one supersedes it.
            checked = undefined;
            return;
          }
          current.isAnswered = true;
          if (outcome.value !== undefined || messages.has(key)) {
            writeMessage(control, key, outcome.value);
          }
        }),
      };
      checked = current;
      return current.settled;
    };

    const followControl = () => {
      follow(control.value);
    };

    /**
     * Holds a submit of a value not answered yet until its check settles, then
     * submits again; stops a submit of a rejected value in a form that skips
     * native validation. Runs in the capture phase on the document, before any
     * listener on the form.
     */
    const holdSubmit = async (event: SubmitEvent) => {
      const { form } = control;
      if (isResubmitting || !form || event.target !== form) return;
      // A submit already held submits once its check settles: drop repeats,
      // such as a double click.
      if (isHolding) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const { value } = control;
      const isUnanswered =
        value.length >= minLength &&
        !(checked?.value === value && checked.isAnswered);
      const isBlocked = messages.has(key) && form.noValidate;
      if (!isUnanswered && !isBlocked) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isUnanswered) {
        isHolding = true;
        await follow(value);
        isHolding = false;
      }
      // A control removed from the form meanwhile no longer holds the submit.
      if (control.form === form && messages.has(key) && form.noValidate) {
        control.checkValidity();
        return;
      }
      const { submitter } = event;
      isResubmitting = true;
      try {
        form.requestSubmit(submitter?.isConnected ? submitter : null);
      } finally {
        isResubmitting = false;
      }
    };

    const document = control.ownerDocument;
    control.addEventListener("input", followControl);
    control.addEventListener("change", followControl);
    document.addEventListener("submit", holdSubmit, true);
    followControl();

    return () => {
      control.removeEventListener("input", followControl);
      control.removeEventListener("change", followControl);
      document.removeEventListener("submit", holdSubmit, true);
      runner.cancel();
      if (!messages.has(key)) return;
      // A re-run attachment adopts the message in this task; otherwise it is
      // cleared once the task is done.
      const orphans = orphansByControl.get(control) ?? [];
      orphans.push(key);
      orphansByControl.set(control, orphans);
      queueMicrotask(() => {
        const index = orphans.indexOf(key);
        if (index === -1) return;
        orphans.splice(index, 1);
        writeMessage(control, key, undefined);
      });
    };
  };
}
