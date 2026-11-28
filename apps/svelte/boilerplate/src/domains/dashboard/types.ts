import type { releases } from "./constants";

export type Release = (typeof releases)[number];
export type Instance = {
  name: string;
  release: Release;
  pro: boolean;
  cloudInit: string;
};
export type Settings = {
  name: string;
  bridge: string;
  ipv6: boolean;
  snapshots: boolean;
  maxInstances: string;
};
