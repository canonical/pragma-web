import guardAccount from "../../../../../domains/account/guardAccount.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = guardAccount;
