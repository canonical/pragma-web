<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import {
    failOnceUpload,
    reportPdf,
    sampleFile,
    simulatedUpload,
    warnOnLargeFiles,
  } from "../../../storybook/fixtures.files.js";
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
<Story
  name="Default"
  args={{
    name: "document",
    label: "Upload document",
    description: "PDF, up to 10 MB.",
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
  }}
/>

<Story
  name="Multiple"
  args={{ name: "documents", label: "Upload documents", multiple: true }}
/>

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
so exceeding it makes the field invalid (rather than the input silently
dropping the extra files). Seeded over the limit; the error renders once the
form is validated. -->
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

<Story
  name="Disabled"
  args={{ name: "file_disabled", label: "Upload (disabled)", disabled: true }}
/>

<!-- Live upload with a simulated server. The form value is the chosen files;
submitting waits until every upload has finished, and a failed upload must be
retried or removed first. A file whose name contains "fail" fails. -->
<Story
  name="Live"
  args={{
    name: "live_documents",
    label: "Upload documents",
    multiple: true,
    upload: simulatedUpload,
  }}
/>

<!-- A failed upload makes the field invalid until it is retried or removed.
Retrying succeeds. -->
<Story
  name="Upload Failed"
  args={{
    name: "failed_documents",
    label: "Upload documents",
    multiple: true,
    upload: failOnceUpload(),
    value: [reportPdf()],
  }}
/>

<!-- Per-file errors (here, a file type `accept` does not allow and a file over
`maxSize`) make the field invalid; a `validateFile` warning does not. -->
<Story
  name="File Messages"
  args={{
    name: "checked_documents",
    label: "Upload documents",
    description: "PDF, up to 10 MB.",
    multiple: true,
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
    validateFile: warnOnLargeFiles,
    value: [
      sampleFile("notes.txt", 2048, "text/plain"),
      sampleFile("scan.pdf", 12 * 1024 * 1024, "application/pdf"),
      sampleFile("brochure.pdf", 3 * 1024 * 1024, "application/pdf"),
    ],
  }}
/>
