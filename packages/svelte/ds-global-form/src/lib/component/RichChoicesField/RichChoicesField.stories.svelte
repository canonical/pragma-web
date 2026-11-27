<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./RichChoicesField.svelte";
  import type { RichChoiceOption } from "./types.js";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome). The `grid: "responsive"` parameter (from
  // @canonical/storybook-addon-utils) puts the story root in a `.grid.responsive`,
  // so the form's subgrid has real column tracks for the option cards to span via
  // `--rich-choices-span` — and the grid mode stays switchable from the toolbar.
  const { Story } = defineMeta({
    title: "components/RichChoicesField",
    component: Component,
    parameters: { grid: "responsive" },
    decorators: [decorators.form()],
  });

  // The version cards are snippets declared in the markup below; this reads
  // them when a story renders.
  const ubuntuVersions = (): RichChoiceOption[] => [
    { value: "24.04", label: noble },
    { value: "23.10", label: mantic },
    { value: "22.04", label: jammy },
    { value: "20.04", label: focal },
  ];
</script>

{#snippet versionCard(version: string, codename: string, lts: boolean)}
  <strong>Ubuntu {version} {#if lts}<span style="opacity: 0.6">LTS</span>{/if}</strong>
  <span style="font-size: 0.85em; opacity: 0.7">{codename}</span>
{/snippet}

{#snippet noble()}{@render versionCard("24.04", "Noble Numbat", true)}{/snippet}
{#snippet mantic()}{@render versionCard("23.10", "Mantic Minotaur", false)}{/snippet}
{#snippet jammy()}{@render versionCard("22.04", "Jammy Jellyfish", true)}{/snippet}
{#snippet focal()}{@render versionCard("20.04", "Focal Fossa", true)}{/snippet}

<Story
  name="Default"
  args={{
    name: "ubuntu_version",
    label: "Choose your Ubuntu version",
    options: ubuntuVersions(),
  }}
/>

<Story
  name="Span Four Columns"
  args={{
    name: "ubuntu_version_4col",
    label: "Choose your Ubuntu version (span 4)",
    style: "--rich-choices-span: span 4",
    options: ubuntuVersions(),
  }}
/>

<Story
  name="Full Width"
  args={{
    name: "release_fullwidth",
    label: "Release channel (full width cards)",
    style: "--rich-choices-span: 1 / -1",
    options: [
      { value: "stable", label: "Stable" },
      { value: "candidate", label: "Candidate" },
      { value: "beta", label: "Beta" },
      { value: "edge", label: "Edge" },
    ],
  }}
/>

<Story
  name="Operating System"
  args={{
    name: "os",
    label: "Choose your operating system",
    options: [
      { value: "ubuntu", label: "Ubuntu" },
      { value: "debian", label: "Debian" },
      { value: "centos", label: "CentOS" },
      { value: "fedora", label: "Fedora" },
      { value: "arch", label: "Arch Linux" },
      { value: "alpine", label: "Alpine" },
    ],
  }}
/>

<Story
  name="Multiple Selection"
  args={{
    name: "features",
    label: "Select features to install",
    isMultiple: true,
    options: [
      { value: "docker", label: "Docker" },
      { value: "kubernetes", label: "Kubernetes" },
      { value: "microk8s", label: "MicroK8s" },
      { value: "lxd", label: "LXD" },
      { value: "juju", label: "Juju" },
      { value: "maas", label: "MAAS" },
    ],
  }}
/>

<Story
  name="Partially Disabled"
  args={{
    name: "release_channel",
    label: "Release channel",
    options: [
      { value: "stable", label: "Stable" },
      { value: "candidate", label: "Candidate" },
      { value: "beta", label: "Beta (unavailable)", disabled: true },
      { value: "edge", label: "Edge (unavailable)", disabled: true },
    ],
  }}
/>

<Story
  name="Disabled"
  args={{
    name: "os_disabled",
    label: "Operating system (disabled)",
    disabled: true,
    options: [
      { value: "ubuntu", label: "Ubuntu" },
      { value: "debian", label: "Debian" },
    ],
  }}
/>
