import type { ActivityEvent, Instance, Release } from "./types.js";

/*
 * Sample data for the dashboard, modelled on LXD. It is data rather than
 * interface copy, so it stays in English in every locale, as the rest of the
 * boilerplate's sample data does.
 */

/** Where the side navigation's Help › Legal information item points. */
export const LEGAL_URL = "https://ubuntu.com/legal";

/** The project the dashboard shows, the first crumb of every page. */
export const PROJECT_NAME = "default";

/** The figures of the overview's status tiles. */
export const OVERVIEW_FIGURES = {
  running: 128,
  stopped: 4,
  storageUsed: "2.4 TB",
  storageTotal: "4 TB",
  alerts: 2,
} as const;

export const INSTANCES: readonly Instance[] = [
  {
    name: "web-01",
    status: "Running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.11",
    memory: "4 GiB",
  },
  {
    name: "web-02",
    status: "Running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.12",
    memory: "4 GiB",
  },
  {
    name: "db-01",
    status: "Running",
    release: "Ubuntu 22.04 LTS",
    ipv4: "10.42.0.21",
    memory: "16 GiB",
  },
  {
    name: "db-02",
    status: "Running",
    release: "Ubuntu 22.04 LTS",
    ipv4: "10.42.0.22",
    memory: "16 GiB",
  },
  {
    name: "cache-01",
    status: "Stopped",
    release: "Ubuntu 24.04 LTS",
    ipv4: "",
    memory: "2 GiB",
  },
  {
    name: "worker-01",
    status: "Running",
    release: "Ubuntu 24.04 LTS",
    ipv4: "10.42.0.41",
    memory: "8 GiB",
  },
];

/** The releases the create form offers, by value. */
export const RELEASE_OPTIONS = [
  { value: "noble", label: "Ubuntu 24.04 LTS" },
  { value: "jammy", label: "Ubuntu 22.04 LTS" },
  { value: "focal", label: "Ubuntu 20.04 LTS" },
];

export const RELEASES: readonly Release[] = [
  {
    name: "Ubuntu 24.04 LTS",
    summary:
      "Noble Numbat. Five years of security updates, ten with Ubuntu Pro.",
    detail: "Stable · kernel 6.8",
  },
  {
    name: "Ubuntu 25.10",
    summary: "Questing Quokka. Interim release with nine months of support.",
    detail: "Beta · kernel 6.17",
  },
];

export const ACTIVITY: readonly ActivityEvent[] = [
  {
    key: "start",
    actor: "Alice",
    datetime: "2 min ago",
    text: "Started web-01",
    criticality: "success",
  },
  {
    key: "snapshot",
    actor: "Scheduler",
    datetime: "14 min ago",
    text: "Snapshot nightly-2026-10-21 taken",
  },
  {
    key: "disk",
    actor: "Monitor",
    datetime: "1 h ago",
    text: "Disk on db-02 at 85%",
    criticality: "warning",
  },
  {
    key: "profile",
    actor: "Bob",
    datetime: "yesterday",
    text: "Profile gpu updated",
  },
  {
    key: "failed",
    actor: "Monitor",
    datetime: "2 days ago",
    text: "cache-01 failed to start",
    criticality: "error",
  },
];
