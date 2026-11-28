import type { Release, Settings } from "./types";

/** The releases an instance can run. */
export const releases = ["noble", "jammy", "focal"] as const;

/** The release choices, as the `/api/releases` endpoint serves them to the create form. */
export const releaseOptions: { value: Release; label: string }[] = [
  { value: "noble", label: "Ubuntu 24.04 LTS" },
  { value: "jammy", label: "Ubuntu 22.04 LTS" },
  { value: "focal", label: "Ubuntu 20.04 LTS" },
];

/** The settings before the demo cookie holds any. */
export const defaultSettings: Settings = {
  name: "Demo",
  bridge: "lxdbr0",
  ipv6: true,
  snapshots: true,
  maxInstances: "50",
};

/** The settings fields, in order. Fields are required unless `isOptional`; a switch is a choice, so it is optional. */
export const settingsFields = [
  { inputType: "text", name: "name", label: "displayName", maxlength: 60 },
  {
    inputType: "select",
    name: "bridge",
    label: "bridge",
    options: [
      { value: "lxdbr0", label: "lxdbr0" },
      { value: "ovn-1", label: "ovn-1" },
    ],
  },
  { inputType: "switch", name: "ipv6", label: "ipv6", isOptional: true },
  {
    inputType: "number",
    name: "maxInstances",
    label: "maxInstances",
    min: 1,
    max: 100,
    step: 1,
  },
  {
    inputType: "switch",
    name: "snapshots",
    label: "snapshots",
    isOptional: true,
  },
] as const;

/** The countries the phone example offers. */
export const phoneCountryCodes: readonly string[] = ["US", "GB"];
