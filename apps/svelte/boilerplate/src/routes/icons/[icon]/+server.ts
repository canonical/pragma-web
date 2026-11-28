import failure from "@canonical/ds-assets/icons/error.svg?raw";
import information from "@canonical/ds-assets/icons/information.svg?raw";
import success from "@canonical/ds-assets/icons/success.svg?raw";
import warning from "@canonical/ds-assets/icons/warning.svg?raw";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const icons: Record<string, string> = {
  "information.svg": information,
  "success.svg": success,
  "warning.svg": warning,
  "error.svg": failure,
};

export const GET: RequestHandler = ({ params }) => {
  const icon = Object.hasOwn(icons, params.icon)
    ? icons[params.icon]
    : undefined;
  if (!icon) error(404, "Icon not found");
  return new Response(icon, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600",
    },
  });
};
