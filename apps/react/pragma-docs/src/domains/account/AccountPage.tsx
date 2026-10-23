import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { CanvasPage } from "#lib/ui";

export default function AccountPage(): ReactElement {
  return (
    <CanvasPage aria-labelledby="account-title">
      <Head title="Account" />
      <h1 id="account-title">Account</h1>
      <p>Protected account page. You are signed in.</p>
    </CanvasPage>
  );
}
