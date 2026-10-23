import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { CanvasPage } from "#lib/ui";

interface LoginSearch {
  readonly from?: string;
}

export default function LoginPage({
  search,
}: {
  search: LoginSearch;
}): ReactElement {
  return (
    <CanvasPage aria-labelledby="login-title">
      <Head title="Login" />
      <h1 id="login-title">Login</h1>
      <p>
        Demo login. Add <code>?auth=1</code> to any protected URL to simulate
        authentication.
      </p>
      {search.from && (
        <p>You will be redirected to {search.from} after login.</p>
      )}
    </CanvasPage>
  );
}
