<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fireEvent, userEvent, waitFor } from "storybook/test";
  import {
    failOnceUpload,
    longNamedIso,
    portraitImage,
    reportPdf,
    sampleFile,
    sampleImage,
    simulatedUpload,
    stalledUpload,
    warnOnLargeFiles,
  } from "../../../storybook/fixtures.files.js";
  import { Error as FieldError } from "../Field/Error/index.js";
  import Component from "./FileUploadInput.svelte";

  // Presentational stories: the file upload holds its own chosen files, no
  // form. Every story renders a fixed state on load, with no timers, so
  // snapshots are stable; the Live story simulates uploads only once files are
  // added.
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

<!-- A disabled input: the drop area and its button are disabled, and the file
list is not drawn, even with a file chosen. -->
<Story
  name="Disabled"
  args={{ files: [reportPdf()], disabled: true, multiple: true }}
/>

<!-- Chosen files without live upload: each tile shows the name, the size and,
for an image, a thumbnail. A long name truncates with an ellipsis; its full
text is the tile's tooltip. -->
<Story
  name="With Files"
  args={{
    files: [reportPdf(), sampleImage(), longNamedIso()],
    multiple: true,
  }}
/>

<!-- The drop area while a file is dragged over it. -->
<Story
  name="Drag Over"
  args={{ files: [], multiple: true }}
  play={({ canvasElement }) => {
    const area = canvasElement.querySelector(".drop-area");
    if (area) fireEvent.dragOver(area);
  }}
/>

<!-- Live upload with a simulated server: add files to watch each upload's
progress and the success icon that follows. A file whose name contains "fail"
fails half-way: its status shows the progress reached and the error icon for a
moment, and its retry button stays. Closing a running upload cancels it and
removes the file. -->
<Story
  name="Live"
  args={{ files: [], multiple: true, upload: simulatedUpload }}
/>

<!-- A live upload in progress, held at 45%. -->
<Story
  name="Uploading"
  args={{ files: [reportPdf()], multiple: true, upload: stalledUpload(0.45) }}
/>

<!-- A failed live upload: the status shows the progress and the error icon for
two seconds, then clears; the message under the tile and the retry button stay.
Retrying succeeds. -->
<Story
  name="Upload Failed"
  args={{ files: [reportPdf()], multiple: true, upload: failOnceUpload() }}
/>

<!-- Per-file messages: `accept` and `maxSize` violations are errors, and
`validateFile` adds a warning for large files. Each message sits under its
file's tile. -->
<Story
  name="File Messages"
  args={{
    files: [
      sampleFile("notes.txt", 2048, "text/plain"),
      sampleFile("scan.pdf", 12 * 1024 * 1024, "application/pdf"),
      sampleFile("brochure.pdf", 3 * 1024 * 1024, "application/pdf"),
    ],
    multiple: true,
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
    validateFile: warnOnLargeFiles,
  }}
/>

<!-- Single-file mode with a file chosen: the drop area hides, and returns when
the file is removed. -->
<Story
  name="Single File Chosen"
  args={{ files: [reportPdf()], multiple: false }}
/>

{#snippet singleFileChosenError()}<FieldError id="single-file-chosen-error">Remove the files that have errors.</FieldError>{/snippet}

<!-- Single-file mode with a file chosen and a field error: the drop area hides,
and the field error still shows above the file list. The file's remove button
is described by the error. -->
<Story
  name="Single File Chosen Error"
  args={{
    files: [reportPdf()],
    multiple: false,
    "aria-invalid": true,
    "aria-describedby": "single-file-chosen-error",
    error: singleFileChosenError,
  }}
/>

<!-- The drop area turned off: only the file list shows. Files reach the input
through `files`. -->
<Story
  name="Without Drop Area"
  args={{
    files: [reportPdf(), sampleImage()],
    multiple: true,
    showDropArea: false,
  }}
/>

{#snippet withoutDropAreaError()}<FieldError id="without-drop-area-error">You can upload at most 1 file.</FieldError>{/snippet}

<!-- The drop area turned off with a field error: the error shows in the drop
area's place, above the file list, and describes the file actions. -->
<Story
  name="Without Drop Area Error"
  args={{
    files: [reportPdf(), sampleImage()],
    multiple: true,
    showDropArea: false,
    "aria-invalid": true,
    "aria-describedby": "without-drop-area-error",
    error: withoutDropAreaError,
  }}
/>

<!-- The file list turned off: the files are chosen but no tiles are drawn. -->
<Story
  name="Without File List"
  args={{
    files: [reportPdf(), sampleImage()],
    multiple: true,
    showFileList: false,
  }}
/>

<!-- Hovering an image's thumbnail shows the whole image, uncropped, in a
tooltip: the thumbnail crops this tall image to its 5:3 box. The story hovers
it on load. -->
<Story
  name="Image Preview"
  args={{ files: [portraitImage()], multiple: true }}
  play={async ({ canvasElement }) => {
    const thumbnail = await waitFor(() => {
      const found = canvasElement.querySelector(".thumbnail-preview .thumbnail");
      if (!found) throw new Error("The thumbnail has no preview yet.");
      return found;
    });
    await userEvent.hover(thumbnail);
  }}
/>
