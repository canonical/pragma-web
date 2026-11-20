import type { SourceDelivery } from "../result/index.js";
import describeError from "./describeError.js";

/**
 * What a network adapter delivers for an error its client reports:
 * `forbidden` where the application's check says the request is not
 * allowed, a failure carrying the error's own words otherwise. A check that
 * throws answers nothing, so the error stands as the failure it is.
 */
export default function resolveErrorDelivery(
  error: unknown,
  isForbidden: ((error: unknown) => boolean) | undefined,
): SourceDelivery<never> {
  let forbidden = false;
  try {
    forbidden = isForbidden?.(error) === true;
  } catch {
    forbidden = false;
  }
  return forbidden
    ? { status: "forbidden", cause: error }
    : {
        status: "failed",
        failure: {
          reason: describeError(error),
          cause: error,
          transient: null,
        },
      };
}
