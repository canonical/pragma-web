/* @canonical/generator-ds 0.9.0-experimental.4 */
import type React from "react";
import type { ComponentProps } from "react";

export type EditMode = "write" | "preview";

type OwnProps = {
  /** Hide the toolbar */
  hideToolbar?: boolean;
  /** Hide the preview pane */
  hidePreview?: boolean;
  /** Hide the border around the editor */
  borderless?: boolean;
  /** Controlled edit mode, leave undefined for internal control */
  editMode?: EditMode;
  /** Callback for edit mode change, needed if editMode is controlled */
  onEditModeChange?: (newEditMode: EditMode) => void;
  /** Textarea styles */
  textareaStyle?: React.CSSProperties;
  /** Preview pane styles */
  previewStyle?: React.CSSProperties;
  /** Control how the switch to preview mode looks */
  previewSwitchMode?: "tab" | "checkbox";
  /** On preview pane overflow, show a button to expand the preview pane */
  emptyInputMessage?: string;
  toolbarBarLabelMessage?: string;
  ToolbarTextFormattingGroupLabelMessage?: string;
  ToolbarToolsGroupLabelMessage?: string;
  ToolbarTitleButtonLabelMessage?: string;
  ToolbarBoldButtonLabelMessage?: string;
  ToolbarItalicButtonLabelMessage?: string;
  ToolbarQuoteButtonLabelMessage?: string;
  ToolbarCodeButtonLabelMessage?: string;
  ToolbarLinkButtonLabelMessage?: string;
  ToolbarUnorderedListButtonLabelMessage?: string;
  ToolbarOrderedListButtonLabelMessage?: string;
};

// The component's DOM root is a `<div>` wrapper, but its public surface is the
// inner `<textarea>`: the `ref` and the remaining native textarea attributes
// (`onChange`, `value`, `maxLength`, …) are forwarded to it. It therefore
// extends the textarea's native props rather than the wrapper's. The wrapper
// takes `id`, `className` and `style`.
export type MarkdownEditorProps = OwnProps &
  Omit<ComponentProps<"textarea">, keyof OwnProps>;
