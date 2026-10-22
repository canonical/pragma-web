import type { EntityBinding } from "@canonical/prism-core";
import {
  EntityLayout,
  type EntityLensOptions,
} from "@canonical/prism-lens-entity";
import {
  type WrapperComponentProps,
  type WrapperDefinition,
  wrapper,
} from "@canonical/router-core";
import type { ReactElement, ReactNode } from "react";
import { MetroRail } from "./MetroRail/index.js";

/**
 * Create the router wrapper an entity lens's routes are grouped under: the
 * entity lens's layout for `binding`, with the metro rail and the lens's
 * label bound to it.
 *
 * @param binding - The class the lens shows.
 * @param lens - The lens's label, the trail's first crumb.
 * @returns The wrapper, identified as `${binding.id}-layout`.
 */
export default function createEntityLayout(
  binding: EntityBinding,
  lens: Pick<EntityLensOptions, "label">,
): WrapperDefinition<ReactElement> {
  const EntityLensLayout = ({
    children,
  }: WrapperComponentProps<ReactNode>): ReactElement => (
    <EntityLayout binding={binding} label={lens.label} rail={<MetroRail />}>
      {children}
    </EntityLayout>
  );
  return wrapper<ReactElement>({
    id: `${binding.id}-layout`,
    component: EntityLensLayout,
  });
}
