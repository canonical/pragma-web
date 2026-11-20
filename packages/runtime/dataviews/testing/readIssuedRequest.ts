/** The request a command issued, failing loudly rather than casting. */
export default function readIssuedRequest(requestId: string | null): string {
  if (requestId === null) {
    throw new Error("expected the command to issue a request");
  }
  return requestId;
}
