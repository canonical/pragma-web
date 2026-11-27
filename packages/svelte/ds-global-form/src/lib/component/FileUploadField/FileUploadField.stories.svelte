<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./FileUploadField.svelte";

  // Field-tier stories: the file upload bound to its `value`, inside a form.
  const { Story } = defineMeta({
    title: "components/FileUploadField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<!-- The native file input carries the field `name`, so the selected files post
in a plain HTML submission too. A form that posts without scripting needs
`enctype="multipart/form-data"`, or the browser sends file names only. -->
<Story name="Default" args={{ name: "document", label: "Upload document" }} />

<Story name="Multiple" args={{ name: "documents", label: "Upload documents", multiple: true }} />

<Story
  name="Images Only"
  args={{
    name: "photos",
    label: "Upload photos",
    accept: "image/*",
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  }}
/>

<!-- Caps the number of files: the field checks `maxFiles` against the selection,
so exceeding it shows a standard field error (rather than the input silently
dropping the extra files). Seeded over the limit so the error renders. -->
<Story
  name="Max Files"
  args={{
    name: "attachments",
    label: "Attachments (max 2)",
    multiple: true,
    maxFiles: 2,
    value: [
      new File(["a"], "one.txt"),
      new File(["b"], "two.txt"),
      new File(["c"], "three.txt"),
    ],
  }}
/>

<Story
  name="Single File"
  args={{
    name: "resume",
    label: "Upload resume",
    accept: ".pdf,.doc,.docx",
    multiple: false,
  }}
/>

<Story name="Disabled" args={{ name: "file_disabled", label: "Upload (disabled)", disabled: true }} />
