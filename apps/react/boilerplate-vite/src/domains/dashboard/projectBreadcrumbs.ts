import type { Item } from "@canonical/ds-types";
import {
  annotateTree,
  findAncestorPath,
  prepareIndex,
} from "@canonical/ds-utils";
import type { NavRoot } from "@canonical/react-ds-app";
import type { BreadcrumbItem } from "@canonical/react-ds-global";

/**
 * Projects a navigation tree onto the breadcrumb trail of one of its items.
 *
 * The side navigation and the breadcrumbs are two views of the same tree of
 * navigation items: the trail is the path from the root to the item whose URL
 * is `currentUrl`, keeping the navigable ancestors (groups carry no URL) and
 * marking the item itself as current. A URL that is not in the tree has no
 * trail.
 */
export default function projectBreadcrumbs(
  root: NavRoot,
  currentUrl: string,
): BreadcrumbItem[] {
  // The side navigation's item type keeps `key` and `url` both optional, which
  // is looser than the navigation item's identity rule (one of them is
  // required) that the tree utilities are typed against. Every item of a side
  // navigation tree carries one by contract, as SideNavigation itself assumes
  // when it indexes the same tree.
  const index = prepareIndex(annotateTree(root as Item));
  const current = index[currentUrl];

  if (current === undefined) {
    return [];
  }

  return findAncestorPath(index, current).flatMap((item): BreadcrumbItem[] => {
    if (item.url === undefined) {
      return [];
    }

    const label = item.label ?? "";

    return item === current
      ? // The current crumb renders without a link, so it is identified by a
        // key; a trail has exactly one, so the key is fixed.
        [{ key: "current", label, current: true }]
      : [{ url: item.url, label }];
  });
}
