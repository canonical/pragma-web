import {
  type ComponentProps,
  createElement,
  useEffect,
  useEffectEvent,
  useRef,
} from "react";
import {
  type RegisterOptions,
  useFormContext,
  useWatch,
  type Validate,
} from "react-hook-form";
import type { BaseInputProps } from "../../common/types.js";
import createMiddleware, {
  type ConfiguredMiddleware,
  type MiddlewareBuilder,
} from "../../common/Wrapper/createMiddleware.js";

interface ValidationOptions {
  /** HTTP method of the validation request. Defaults to `"POST"`. */
  method?: string;
  /** Headers sent with the validation request. Default to a JSON content type. */
  headers?: Record<string, string>;
  /** Builds the JSON request body from the value. Defaults to `{ value }`. */
  bodyFormatter?: (value: string) => unknown;
  /** Reads the error message from a failed response. */
  errorExtractor?: (response: Response) => Promise<string> | string;
  /** Shortest value that is sent for validation. Defaults to 3. */
  minLength?: number;
  /** Milliseconds to wait after the last change before sending. Defaults to 300. */
  debounceWait?: number;
}

/** The settings of one validation middleware, with its defaults applied. */
type ValidationSettings = Required<ValidationOptions> & { url: string };

/**
 * The error type the middleware sets, and the name of the `validate` rule it
 * registers, so it only ever clears its own error.
 */
const REST_VALIDATION_ERROR_TYPE = "restValidation";

/** The message shown when the endpoint rejects a value without a readable one. */
const DEFAULT_ERROR_MESSAGE = "Validation failed";

/**
 * What the endpoint said about a value: valid, invalid with a message, or
 * nothing, when the request failed or a newer value replaced it.
 */
type Answer =
  | { kind: "valid" }
  | { kind: "invalid"; message: string }
  | { kind: "none" };

const VALID: Answer = { kind: "valid" };
const NO_ANSWER: Answer = { kind: "none" };

/** A check of one value against one URL, waiting for its debounce or answer. */
type PendingCheck = {
  url: string;
  value: string;
  answer: Promise<Answer>;
  /** Stops the timer and the request; the answer becomes `none`. */
  cancel: () => void;
};

/** A middleware that works with any field. */
type ValidationMiddleware = ConfiguredMiddleware<BaseInputProps>;

/** Whether a value is long enough, and a string, to be sent. */
const isCheckable = (value: unknown, minLength: number): value is string =>
  typeof value === "string" && value.length >= minLength;

/**
 * Reads the message of a rejected value, falling back to the default when
 * `errorExtractor` cannot read the response, so the value still shows as
 * rejected.
 */
const readErrorMessage = async (
  response: Response,
  errorExtractor: ValidationSettings["errorExtractor"],
): Promise<string> => {
  try {
    return await errorExtractor(response);
  } catch {
    return DEFAULT_ERROR_MESSAGE;
  }
};

/**
 * Sends the value and reads the endpoint's answer. A request that fails to
 * complete, or is aborted, says nothing about the value.
 * @note Impure: performs a network request.
 */
const requestAnswer = async (
  url: string,
  value: string,
  { method, headers, bodyFormatter, errorExtractor }: ValidationSettings,
  signal: AbortSignal,
): Promise<Answer> => {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(bodyFormatter(value)),
      signal,
    });
    if (response.ok) return signal.aborted ? NO_ANSWER : VALID;
    const message = await readErrorMessage(response, errorExtractor);
    return signal.aborted ? NO_ANSWER : { kind: "invalid", message };
  } catch {
    return NO_ANSWER;
  }
};

/**
 * Starts a check that sends the value once `debounceWait` has passed.
 * @note Impure: schedules a timer and a network request.
 */
const startCheck = (
  url: string,
  value: string,
  settings: ValidationSettings,
): PendingCheck => {
  const controller = new AbortController();
  let cancel = () => {};
  const answer = new Promise<Answer>((resolve) => {
    const timer = setTimeout(() => {
      requestAnswer(url, value, settings, controller.signal).then(resolve);
    }, settings.debounceWait);
    cancel = () => {
      clearTimeout(timer);
      controller.abort();
      resolve(NO_ANSWER);
    };
  });
  return { url, value, answer, cancel: () => cancel() };
};

/**
 * Adds a rule to the field's `validate` rules, keeping the rules it has. A
 * single `validate` function stays under the `validate` name, the error type
 * react-hook-form gives it.
 */
const addValidateRule = (
  registerProps: RegisterOptions | undefined,
  rule: Validate<unknown, unknown>,
): RegisterOptions => {
  const validate = registerProps?.validate;
  const rules = typeof validate === "function" ? { validate } : validate;
  return {
    ...registerProps,
    validate: { ...rules, [REST_VALIDATION_ERROR_TYPE]: rule },
  } as RegisterOptions;
};

/** Builds the component that checks the value and owns the REST error. */
const buildRESTValidation: MiddlewareBuilder<
  ValidationSettings,
  BaseInputProps
> = (WrappedComponent, useSettings) => {
  function WithRESTValidation(props: ComponentProps<typeof WrappedComponent>) {
    const { name } = props;
    const settings = useSettings();
    const { url } = settings;
    const { setError, clearErrors, getFieldState } = useFormContext();
    const value: unknown = useWatch({ name });
    const pending = useRef<PendingCheck | null>(null);

    /** Clears the field's error when this middleware set it. */
    const clearOwnError = () => {
      if (getFieldState(name).error?.type === REST_VALIDATION_ERROR_TYPE) {
        clearErrors(name);
      }
    };

    /** Stops the pending check, if any. */
    const cancelPending = () => {
      pending.current?.cancel();
      pending.current = null;
    };

    /**
     * Resolves to the answer for a value, sharing the pending check when it is
     * for the same value and URL, so typing and submitting send one request.
     * A newer value cancels the previous check, so only the answer for the
     * latest value is ever used. A check that got no answer is dropped, so the
     * next one asks again.
     */
    const check = (checkUrl: string, checkValue: string): Promise<Answer> => {
      const current = pending.current;
      if (current?.url === checkUrl && current.value === checkValue) {
        return current.answer;
      }
      cancelPending();
      const next = startCheck(checkUrl, checkValue, settings);
      pending.current = next;
      next.answer.then((answer) => {
        if (answer.kind === "none" && pending.current === next) {
          pending.current = null;
        }
      });
      return next.answer;
    };

    /**
     * The `validate` rule react-hook-form runs, on submit among others, so a
     * value the endpoint rejected cannot be submitted. Without an answer it
     * keeps the message this middleware last set.
     */
    const validateRemotely = async (
      fieldValue: unknown,
    ): Promise<string | true> => {
      if (!isCheckable(fieldValue, settings.minLength)) return true;
      const answer = await check(url, fieldValue);
      if (answer.kind === "valid") return true;
      if (answer.kind === "invalid") return answer.message;
      const { error } = getFieldState(name);
      return (
        (error?.type === REST_VALIDATION_ERROR_TYPE && error.message) || true
      );
    };

    const followValue = useEffectEvent(
      (nextValue: unknown, nextUrl: string) => {
        if (!isCheckable(nextValue, settings.minLength)) {
          cancelPending();
          clearOwnError();
          return;
        }
        check(nextUrl, nextValue).then((answer) => {
          if (answer.kind === "valid") {
            clearOwnError();
          } else if (answer.kind === "invalid") {
            setError(name, {
              type: REST_VALIDATION_ERROR_TYPE,
              message: answer.message,
            });
          }
          // A check without an answer leaves the field's error as it is.
        });
      },
    );

    useEffect(() => followValue(value, url), [value, url]);

    useEffect(
      () => () => {
        pending.current?.cancel();
        pending.current = null;
      },
      [],
    );

    return createElement(WrappedComponent, {
      ...props,
      registerProps: addValidateRule(props.registerProps, validateRemotely),
    });
  }
  return WithRESTValidation;
};

const configureRESTValidation = createMiddleware(buildRESTValidation);

/**
 * Validates a field's value against a REST endpoint once the user stops
 * typing, and sets the field's error when the endpoint rejects it.
 *
 * The check is also registered as the field's `restValidation` rule, so
 * submitting re-checks the value and a rejected value blocks the submit. Each
 * change cancels the pending timer and aborts the request in flight, so only
 * the answer for the latest value can set or clear the error; unmounting the
 * field does the same. A request that fails to complete keeps the previous
 * message. It only clears the error it set, so an error from the field's own
 * rules or another middleware stays in place. The middleware can be created
 * inline: the field keeps one instance.
 *
 * @param url - The endpoint validating the value.
 * @param options - Request, debounce and error options.
 * @returns A middleware for any field.
 *
 * `import { addRESTValidation } from "@canonical/react-ds-global-form";`
 */
function addRESTFieldValidation(
  url: string,
  options: ValidationOptions = {},
): ValidationMiddleware {
  const {
    method = "POST",
    headers = { "Content-Type": "application/json" },
    bodyFormatter = (value: string) => ({ value }),
    errorExtractor = () => DEFAULT_ERROR_MESSAGE,
    minLength = 3,
    debounceWait = 300,
  } = options;
  return configureRESTValidation({
    url,
    method,
    headers,
    bodyFormatter,
    errorExtractor,
    minLength,
    debounceWait,
  });
}

export default addRESTFieldValidation;
