/**
 * SideNavigation cases rendered by both React and Svelte for the markup
 * parity test. Plain data only, so one file feeds both renderers: `brand`,
 * `slot` and `badge` strings render as `<span>{text}</span>` on both sides, and
 * `onClick: true` stands for "has a click handler".
 */
export interface GoldenCase {
  props: Record<string, unknown>;
}

const contentRoot = {
  key: "root",
  items: [
    {
      key: "hardware",
      label: "Hardware",
      items: [
        { url: "/machines", label: "Machines", icon: "machines", slot: "42" },
        { url: "/devices", label: "Devices", icon: "units" },
        { url: "/off", label: "Unavailable", disabled: true },
        { key: "plain", label: "Plain label", className: "extra" },
      ],
    },
    { key: "empty", label: "Empty" },
    {
      key: "help-group",
      items: [
        {
          key: "help",
          label: "Help",
          icon: "help",
          items: [
            { key: "help-legal", url: "/legal", label: "Legal information" },
            { url: "/docs", label: "Docs" },
          ],
        },
      ],
    },
  ],
};

const footerRoot = {
  key: "footer",
  items: [
    { url: "/settings", label: "Settings", icon: "settings" },
    { label: "admin", icon: "user" },
    { label: "Log out", icon: "log-out", control: "button" },
    { label: "Notify", onClick: true, slot: "3" },
    {
      label: "Theme",
      icon: "dark-theme",
      items: [
        { url: "/theme/light", label: "Light" },
        { label: "Dark", control: "button" },
      ],
    },
  ],
};

const contextSwitcher = {
  title: "Project",
  currentContext: { key: "default", name: "default", description: "Default" },
  contexts: [
    { key: "default", name: "default", description: "Default" },
    {
      key: "staging",
      name: "staging",
      url: "/staging",
      description: "Pre-production",
      badge: "12",
    },
  ],
};

export const goldenCases: Record<string, GoldenCase> = {
  minimal: { props: {} },
  full: {
    props: {
      brand: "Logo",
      applicationName: "MAAS",
      root: contentRoot,
      footerRoot,
      currentUrl: "/docs",
      contextSwitcher: { ...contextSwitcher, onCreateContext: true },
      id: "nav",
      "data-testid": "side-navigation",
    },
  },
  footerActive: {
    props: { root: contentRoot, footerRoot, currentUrl: "/theme/light" },
  },
  collapsed: {
    props: {
      defaultExpanded: false,
      root: contentRoot,
      currentUrl: "/machines",
      skipTo: "#content",
      "aria-label": "Primary",
      className: "custom",
    },
  },
  messages: {
    props: {
      root: contentRoot,
      messages: {
        skipToContent: "Aller au contenu",
        navigation: "Navigation principale",
        collapseNavigation: "Réduire la navigation",
        openMenu: "Menu FR",
        closeMenu: "Fermer le menu",
      },
      contextSwitcher: { ...contextSwitcher, title: undefined },
    },
  },
};
