<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./FileUploadInput.svelte";

  // Presentational stories: the file upload holds its own selected files, no form.
  const { Story } = defineMeta({
    title: "subcomponents/FileUploadInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ files: [] }} />

<Story name="Multiple" args={{ files: [], multiple: true }} />

<Story
  name="Images Only"
  args={{
    files: [],
    accept: "image/*",
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  }}
/>

<Story
  name="Single File"
  args={{ files: [], accept: ".pdf,.doc,.docx", multiple: false }}
/>

<Story name="Disabled" args={{ files: [], disabled: true }} />
