/**
 * Story fixtures for the machine collection: the twelve records and the
 * collection they belong to. Story-only: this folder is excluded from the
 * package build, and the unit tests take their own collection and pages from
 * `testing/`. Hosts are `example.com` and people are `ex:*` personas, as in
 * the package's tests; each story's source is built by its own factory beside
 * this file.
 */

import { createCollection } from "@canonical/dataviews-core";
import type { Machine } from "./types.js";

/** Twelve machines, every status represented; one story pages them by five. */
export const machines = [
  {
    id: "m-01",
    name: "alder.example.com",
    status: "running",
    region: "eu-west-1",
    cores: 4,
    owner: "ex:ana",
    note: "Nominal.",
  },
  {
    id: "m-02",
    name: "birch.example.com",
    status: "failed",
    region: "eu-west-1",
    cores: 8,
    owner: "ex:ben",
    note: "Commissioning stopped after the second reboot; the storage controller did not enumerate any of its attached disks.",
  },
  {
    id: "m-03",
    name: "cedar.example.com",
    status: "running",
    region: "us-east-2",
    cores: 16,
    owner: "ex:cai",
    note: "Nominal.",
  },
  {
    id: "m-04",
    name: "dogwood.example.com",
    status: "pending",
    region: "us-east-2",
    cores: 2,
    owner: "ex:dia",
    note: "Waiting on an address from the upstream pool.",
  },
  {
    id: "m-05",
    name: "elm.example.com",
    status: "running",
    region: "ap-south-1",
    cores: 32,
    owner: "ex:eze",
    note: "Nominal.",
  },
  {
    id: "m-06",
    name: "fir.example.com",
    status: "failed",
    region: "ap-south-1",
    cores: 4,
    owner: "ex:fay",
    note: "Power driver reported the outlet as off while the machine answered on the network.",
  },
  {
    id: "m-07",
    name: "gum.example.com",
    status: "running",
    region: "eu-west-1",
    cores: 8,
    owner: "ex:gil",
    note: "Nominal.",
  },
  {
    id: "m-08",
    name: "hazel.example.com",
    status: "pending",
    region: "us-east-2",
    cores: 16,
    owner: "ex:hen",
    note: "Queued behind two other deployments in the same rack.",
  },
  {
    id: "m-09",
    name: "ironwood.example.com",
    status: "running",
    region: "ap-south-1",
    cores: 64,
    owner: "ex:ivy",
    note: "Nominal.",
  },
  {
    id: "m-10",
    name: "juniper.example.com",
    status: "failed",
    region: "eu-west-1",
    cores: 2,
    owner: "ex:jun",
    note: "Disk self-test reported reallocated sectors on both attached drives.",
  },
  {
    id: "m-11",
    name: "karri.example.com",
    status: "running",
    region: "us-east-2",
    cores: 4,
    owner: "ex:kit",
    note: "Nominal.",
  },
  {
    id: "m-12",
    name: "larch.example.com",
    status: "pending",
    region: "ap-south-1",
    cores: 8,
    owner: "ex:lex",
    note: "Nominal.",
  },
] as const satisfies readonly Machine[];

/**
 * The machine collection, declared once at module scope: its schema —
 * every field with its kind, which decides both the filter control a field
 * offers (text is filtered by what it contains) and how an ordered term over
 * it compares — and the identity every machine carries. It is the witness
 * every story's provider is built over and every custom child names.
 */
export const machineCollection = createCollection({
  identify: (machine: Machine) => machine.id,
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["running", "failed", "pending"],
    },
    { field: "cores", kind: "number", min: 1 },
    { field: "name", kind: "text" },
    { field: "region", kind: "text" },
    { field: "owner", kind: "text" },
  ],
});
