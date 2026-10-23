// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  Badge,
  Button,
  Chip,
  InlineCode,
  KeyboardKey,
} from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { EXAMPLE_BADGE_VALUE, EXAMPLE_KEY } from "./constants.js";
import type { UIBlockExampleProps } from "./types.js";

/**
 * A UI block's rendered example: the published React component of the
 * block with its default props, given only what it cannot render without (a
 * label, a count, a key). It renders on the server as on the client, so a
 * card's sidecar shows the actual component before any script runs. A
 * button example is a plain button, which submits nothing.
 *
 * It renders no element of its own: the published component is the root,
 * styled by its own package.
 *
 * `import { UIBlockExample } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_example
 * @note Impure: reads its labels from the translator in scope.
 */
export default function UIBlockExample({
  example,
}: UIBlockExampleProps): ReactElement {
  const t = useMessages();
  switch (example) {
    case "badge":
      return <Badge value={EXAMPLE_BADGE_VALUE} />;
    case "button":
      return <Button type="button">{t("example.button")}</Button>;
    case "chip":
      return <Chip value={t("example.chip")} />;
    case "inlineCode":
      return <InlineCode>{t("example.inlineCode")}</InlineCode>;
    case "keyboardKey":
      return <KeyboardKey keyValue={EXAMPLE_KEY} />;
  }
}
