import { type Browser, chromium } from "playwright";
import { CHROMIUM_EXECUTABLE_PATH_ENV_VAR } from "./constants.js";

/**
 * Launch a headless Chromium: the binary the environment names, or else the
 * one Playwright installed. A container whose Chromium build differs from
 * the revision Playwright pins names its own binary through the variable.
 *
 * @returns The browser, which the caller closes.
 * @note Impure: reads the environment and spawns a browser process.
 */
export default function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    executablePath: process.env[CHROMIUM_EXECUTABLE_PATH_ENV_VAR],
  });
}
