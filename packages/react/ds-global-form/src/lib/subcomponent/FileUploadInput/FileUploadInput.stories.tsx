import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fireEvent } from "storybook/test";
import {
  failOnceUpload,
  longNamedIso,
  reportPdf,
  sampleFile,
  sampleImage,
  simulatedUpload,
  stalledUpload,
  warnOnLargeFiles,
} from "../../../storybook/fixtures.files.js";
import { FileUploadInput } from "./FileUploadInput.js";
import type { FileUploadInputProps } from "./types.js";

// Presentational stories: the file upload is controlled directly, no form.
// Every story renders a fixed state on load, with no timers, so snapshots are
// stable; the Live story simulates uploads only once files are added.
const meta = {
  title: "subcomponents/FileUploadInput",
  component: FileUploadInput,
} satisfies Meta<typeof FileUploadInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Renders the input with its value in state, seeded from `initial`. */
const controlled =
  (initial: () => File[] = () => []) =>
  (args: FileUploadInputProps) => {
    const [value, setValue] = useState<File[]>(initial);
    return <FileUploadInput {...args} value={value} onChange={setValue} />;
  };

export const Default: Story = {
  render: controlled(),
};

export const Multiple: Story = {
  render: controlled(),
  args: { multiple: true },
};

export const ImagesOnly: Story = {
  render: controlled(),
  args: {
    accept: "image/*",
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  },
};

export const SingleFile: Story = {
  render: controlled(),
  args: { accept: ".pdf,.doc,.docx", multiple: false },
};

/**
 * A disabled input: the drop area and its button are disabled, and the file
 * list is not drawn, even with a file chosen.
 */
export const Disabled: Story = {
  render: controlled(() => [reportPdf()]),
  args: { disabled: true, multiple: true },
};

/**
 * Chosen files without live upload: each tile shows the name, the size and,
 * for an image, a thumbnail. A long name truncates with an ellipsis; its full
 * text is the tile's tooltip.
 */
export const WithFiles: Story = {
  render: controlled(() => [reportPdf(), sampleImage(), longNamedIso()]),
  args: { multiple: true },
};

/** The drop area while a file is dragged over it. */
export const DragOver: Story = {
  render: controlled(),
  args: { multiple: true },
  play: ({ canvasElement }) => {
    const area = canvasElement.querySelector(".drop-area");
    if (area) fireEvent.dragOver(area);
  },
};

/**
 * Live upload with a simulated server: add files to watch each upload's
 * progress and the success icon that follows. A file whose name contains
 * "fail" fails half-way; retry it, or cancel a running upload with its close
 * button.
 */
export const Live: Story = {
  render: controlled(),
  args: { multiple: true, upload: simulatedUpload },
};

/** A live upload in progress, held at 45%. */
export const Uploading: Story = {
  render: controlled(() => [reportPdf()]),
  args: { multiple: true, upload: stalledUpload(0.45) },
};

/**
 * A failed live upload: the tile shows the error status, the message under
 * it, and a retry button. Retrying succeeds.
 */
export const UploadFailed: Story = {
  render: controlled(() => [reportPdf()]),
  args: { multiple: true, upload: failOnceUpload() },
};

/**
 * Per-file messages: `accept` and `maxSize` violations are errors, and
 * `validateFile` adds a warning for large files. Each message sits under its
 * file's tile.
 */
export const FileMessages: Story = {
  render: controlled(() => [
    sampleFile("notes.txt", 2048, "text/plain"),
    sampleFile("scan.pdf", 12 * 1024 * 1024, "application/pdf"),
    sampleFile("brochure.pdf", 3 * 1024 * 1024, "application/pdf"),
  ]),
  args: {
    multiple: true,
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
    validateFile: warnOnLargeFiles,
  },
};

/**
 * Single-file mode with a file chosen: the drop area hides, and returns when
 * the file is removed.
 */
export const SingleFileChosen: Story = {
  render: controlled(() => [reportPdf()]),
  args: { multiple: false },
};
