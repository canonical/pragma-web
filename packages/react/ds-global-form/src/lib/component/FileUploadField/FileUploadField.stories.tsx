import type { Meta, StoryObj } from "@storybook/react-vite";
import * as decorators from "storybook/decorators.js";
import {
  failOnceUpload,
  reportPdf,
  sampleFile,
  simulatedUpload,
  warnOnLargeFiles,
} from "../../../storybook/fixtures.files.js";
import { FileUploadField } from "./index.js";

// Field-tier stories: the file upload bound to react-hook-form, inside a form.
const meta = {
  title: "components/FileUploadField",
  component: FileUploadField,
  decorators: [decorators.form()],
} satisfies Meta<typeof FileUploadField>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The native file input carries the field `name`, so the selected files post
 * in a plain HTML submission too. A form that posts without scripting needs
 * `enctype="multipart/form-data"`, or the browser sends file names only.
 */
export const Default: Story = {
  args: {
    name: "document",
    label: "Upload document",
    description: "PDF, up to 10 MB.",
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
  },
};

export const Multiple: Story = {
  args: {
    name: "documents",
    label: "Upload documents",
    multiple: true,
  },
};

export const ImagesOnly: Story = {
  args: {
    name: "photos",
    label: "Upload photos",
    accept: "image/*",
    multiple: true,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  },
};

/**
 * Caps the number of files: `maxFiles` is enforced as a react-hook-form
 * `validate` rule, so exceeding it shows a standard field error (rather than the
 * input silently dropping the extra files). Seeded over the limit + touched so
 * the error renders.
 */
export const MaxFiles: Story = {
  args: {
    name: "attachments",
    label: "Attachments (max 2)",
    multiple: true,
    maxFiles: 2,
  },
  decorators: [
    decorators.form({
      defaultValues: {
        attachments: [
          new File(["a"], "one.txt"),
          new File(["b"], "two.txt"),
          new File(["c"], "three.txt"),
        ],
      },
      touchedFields: ["attachments"],
    }),
  ],
};

export const SingleFile: Story = {
  args: {
    name: "resume",
    label: "Upload resume",
    accept: ".pdf,.doc,.docx",
    multiple: false,
  },
};

export const Disabled: Story = {
  args: {
    name: "file_disabled",
    label: "Upload (disabled)",
    disabled: true,
  },
};

/**
 * Live upload with a simulated server. The form value is the chosen files;
 * submitting waits until every upload has finished, and a failed upload must
 * be retried or removed first. A file whose name contains "fail" fails.
 */
export const Live: Story = {
  args: {
    name: "live_documents",
    label: "Upload documents",
    multiple: true,
    upload: simulatedUpload,
  },
};

/**
 * A failed upload makes the field invalid until it is retried or removed.
 * Retrying succeeds.
 */
export const UploadFailed: Story = {
  args: {
    name: "failed_documents",
    label: "Upload documents",
    multiple: true,
    upload: failOnceUpload(),
  },
  decorators: [
    decorators.form({
      defaultValues: { failed_documents: [reportPdf()] },
    }),
  ],
};

/**
 * Per-file errors (here, a file type `accept` does not allow and a file over
 * `maxSize`) make the field invalid; a `validateFile` warning does not.
 */
export const FileMessages: Story = {
  args: {
    name: "checked_documents",
    label: "Upload documents",
    description: "PDF, up to 10 MB.",
    multiple: true,
    accept: ".pdf",
    maxSize: 10 * 1024 * 1024,
    validateFile: warnOnLargeFiles,
  },
  decorators: [
    decorators.form({
      defaultValues: {
        checked_documents: [
          sampleFile("notes.txt", 2048, "text/plain"),
          sampleFile("scan.pdf", 12 * 1024 * 1024, "application/pdf"),
          sampleFile("brochure.pdf", 3 * 1024 * 1024, "application/pdf"),
        ],
      },
    }),
  ],
};
