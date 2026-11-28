import type { MessageKey } from "../../i18n/index.js";
import type {
  ActivityEvent,
  Instance,
  InstanceStatus,
  Release,
} from "./types.js";

/*
 * Sample data for the dashboard, modelled on LXD. Every word a reader sees is
 * a catalog key, so the dashboard reads fully in each locale; what stays as is
 * are names — instance and project names, people, product names, addresses —
 * which are the same in every language.
 */

/** Where the side navigation's Help › Legal information item points. */
export const LEGAL_URL = "https://ubuntu.com/legal";

/** The project the dashboard shows, the first crumb of every page. */
export const PROJECT_NAME = "default";

/** The figures of the overview's status tiles; storage is in terabytes. */
export const OVERVIEW_FIGURES = {
  running: 128,
  stopped: 4,
  storageUsedTb: 2.4,
  storageTotalTb: 4,
  alerts: 2,
} as const;

/** How the overview formats a size in terabytes: "2.4 TB", "2,4 To". */
export const TERABYTES: Intl.NumberFormatOptions = {
  style: "unit",
  unit: "terabyte",
  maximumFractionDigits: 1,
};

/** The catalog key of each instance status's label. */
export const STATUS_KEYS: Readonly<Record<InstanceStatus, MessageKey>> = {
  running: "dashboard.status.running",
  stopped: "dashboard.status.stopped",
  starting: "dashboard.status.starting",
};

export const INSTANCES: readonly Instance[] = [
  {
    name: "web-01",
    status: "running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.11",
    memoryGib: 4,
  },
  {
    name: "web-02",
    status: "running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.12",
    memoryGib: 4,
  },
  {
    name: "db-01",
    status: "running",
    release: "Ubuntu 22.04 LTS",
    ipv4: "10.42.0.21",
    memoryGib: 16,
  },
  {
    name: "db-02",
    status: "running",
    release: "Ubuntu 22.04 LTS",
    ipv4: "10.42.0.22",
    memoryGib: 16,
  },
  {
    name: "cache-01",
    status: "stopped",
    release: "Ubuntu 24.04 LTS",
    ipv4: "",
    memoryGib: 2,
  },
  {
    name: "worker-01",
    status: "running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.41",
    memoryGib: 8,
  },
];

/** The releases the create form offers, by value; labels are product names. */
export const RELEASE_OPTIONS = [
  { value: "noble", label: "Ubuntu 24.04 LTS" },
  { value: "jammy", label: "Ubuntu 22.04 LTS" },
  { value: "focal", label: "Ubuntu 20.04 LTS" },
];

export const RELEASES: readonly Release[] = [
  {
    name: "Ubuntu 24.04 LTS",
    summaryKey: "dashboard.releases.noble",
    channel: "stable",
    kernel: "6.8",
  },
  {
    name: "Ubuntu 25.10",
    summaryKey: "dashboard.releases.questing",
    channel: "beta",
    kernel: "6.17",
  },
];

/** The catalog key of each release channel's label. */
export const CHANNEL_KEYS: Readonly<Record<Release["channel"], MessageKey>> = {
  stable: "dashboard.releases.stable",
  beta: "dashboard.releases.beta",
};

export const ACTIVITY: readonly ActivityEvent[] = [
  {
    key: "start",
    actor: { name: "Alice" },
    minutesAgo: 2,
    messageKey: "dashboard.activity.started",
    values: { instance: "web-01" },
    criticality: "success",
  },
  {
    key: "snapshot",
    actor: { key: "dashboard.activity.scheduler" },
    minutesAgo: 14,
    messageKey: "dashboard.activity.snapshot",
    values: { snapshot: "nightly-2026-10-21" },
  },
  {
    key: "disk",
    actor: { key: "dashboard.activity.monitor" },
    minutesAgo: 60,
    messageKey: "dashboard.activity.disk",
    values: { instance: "db-02", percent: "85" },
    criticality: "warning",
  },
  {
    key: "profile",
    actor: { name: "Bob" },
    minutesAgo: 24 * 60,
    messageKey: "dashboard.activity.profile",
    values: { profile: "gpu" },
  },
  {
    key: "failed",
    actor: { key: "dashboard.activity.monitor" },
    minutesAgo: 2 * 24 * 60,
    messageKey: "dashboard.activity.failed",
    values: { instance: "cache-01" },
    criticality: "error",
  },
];

/** The create form's prefilled values: a second web server on 24.04. */
export const CREATE_DEFAULTS = {
  instance_name: "web-03",
  release: "noble",
  enable_pro: true,
  cloud_init: "#cloud-config\npackages:\n  - nginx",
} as const;

/** The project's current settings, prefilled into the settings form. */
export const SETTINGS_DEFAULTS = {
  bridge: "lxdbr0",
  ipv6: true,
  max_instances: 50,
  snapshots: true,
} as const;

/** The bridges the settings form offers. */
export const BRIDGE_OPTIONS = [
  { value: "lxdbr0", label: "lxdbr0" },
  { value: "ovn-1", label: "ovn-1" },
];
