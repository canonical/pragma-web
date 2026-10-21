import {
  defaultComponents,
  Markdown,
  type MarkdownComponents,
} from "@canonical/react-markdown";
import hljs from "highlight.js";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import "../GitDiffViewer/common/CodeDiffViewer/HighlighTheme.css";
import {
  icons,
  PreviewHeading,
  Toolbar,
  ViewModeTabs,
  type ViewModeTabsProps,
} from "./common/index.js";
import { useEditor } from "./hooks/index.js";
import "./styles.css";
import type { EditMode, MarkdownEditorProps } from "./types.js";

const componentCssClassName = "ds markdown-editor";
const borderCssClassName = "bordered";

// The preview renders through the design-system elements, demotes top-level
// headings so a comment never outranks its host page, and drops heading ids,
// which several previews on one page would otherwise duplicate.
const previewComponents: MarkdownComponents = {
  ...defaultComponents,
  h1: (props) => <PreviewHeading {...props} as="h3" />,
  h2: (props) => <PreviewHeading {...props} as="h3" />,
  h3: (props) => <PreviewHeading {...props} as="h3" />,
  h4: (props) => <PreviewHeading {...props} as="h4" />,
  h5: (props) => <PreviewHeading {...props} as="h5" />,
  h6: (props) => <PreviewHeading {...props} as="h6" />,
};

/**
 * A dual-mode Markdown editor for writing and previewing Markdown content.
 */
const MarkdownEditor = forwardRef(
  (
    {
      id,
      className,
      style,
      textareaStyle,
      previewStyle,
      defaultValue,
      placeholder,
      hideToolbar = false,
      hidePreview = false,
      previewSwitchMode = "tab",
      borderless = false,
      editMode: controlledEditMode,
      onEditModeChange: controlledOnEditModeChange,
      emptyInputMessage = "No content",
      toolbarBarLabelMessage = "Markdown Editor",
      ToolbarTextFormattingGroupLabelMessage = "Text Formatting",
      ToolbarToolsGroupLabelMessage = "Tools",
      ToolbarTitleButtonLabelMessage = "Title",
      ToolbarBoldButtonLabelMessage = "Bold",
      ToolbarItalicButtonLabelMessage = "Italic",
      ToolbarQuoteButtonLabelMessage = "Quote",
      ToolbarCodeButtonLabelMessage = "Code",
      ToolbarLinkButtonLabelMessage = "Link",
      ToolbarUnorderedListButtonLabelMessage = "Unordered List",
      ToolbarOrderedListButtonLabelMessage = "Ordered List",
      ...textareaProps
    }: MarkdownEditorProps,
    ref: React.Ref<HTMLTextAreaElement>,
  ): React.ReactElement => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const [internalEditMode, setInternalEditMode] = useState<EditMode>("write");
    const [shouldFocusTextarea, setShouldFocusTextarea] = useState(false);
    const { toolbar } = useEditor(textareaRef);

    const editMode = useMemo(() => {
      return controlledEditMode ?? internalEditMode;
    }, [controlledEditMode, internalEditMode]);

    const handleEditModeChange: ViewModeTabsProps["onEditModeChange"] =
      useCallback(
        (newEditMode, eventType) => {
          if (controlledOnEditModeChange) {
            controlledOnEditModeChange(newEditMode);
          } else {
            setInternalEditMode(newEditMode);
          }
          // Set flag to focus textarea when switching to write mode after click
          if (eventType === "click" && newEditMode === "write") {
            setShouldFocusTextarea(true);
          }
        },
        [controlledOnEditModeChange],
      );

    useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
      ref,
      () => textareaRef.current,
    );

    // Focus textarea when edit mode changes to "write"
    useEffect(() => {
      if (editMode === "write" && shouldFocusTextarea) {
        // Use a small timeout to ensure DOM has updated
        const focusTimeout = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
          setShouldFocusTextarea(false);
        }, 10);

        return () => clearTimeout(focusTimeout);
      }
    }, [editMode, shouldFocusTextarea]);

    useEffect(() => {
      if (previewRef.current && editMode === "preview") {
        for (const codeBlock of Array.from(
          previewRef.current.querySelectorAll<HTMLElement>("pre code"),
        )) {
          if (!codeBlock.dataset.highlighted) {
            hljs.highlightElement(codeBlock);
          }
        }
      }
    }, [editMode]);

    return (
      <div
        id={id}
        style={style}
        className={[
          componentCssClassName,
          className,
          !borderless && borderCssClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="top-bar">
          {!hidePreview && previewSwitchMode === "tab" && (
            <ViewModeTabs
              editMode={editMode}
              onEditModeChange={handleEditModeChange}
            />
          )}
          {!hideToolbar && toolbar && (
            <Toolbar label={toolbarBarLabelMessage}>
              <Toolbar.Group label={ToolbarTextFormattingGroupLabelMessage}>
                <Toolbar.Button
                  label={ToolbarTitleButtonLabelMessage}
                  onClick={toolbar.title.handler}
                  shortcut={toolbar.title.shortcut}
                >
                  {icons.ToolbarTitle}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarBoldButtonLabelMessage}
                  onClick={toolbar.bold.handler}
                  shortcut={toolbar.bold.shortcut}
                >
                  {icons.ToolbarBold}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarItalicButtonLabelMessage}
                  onClick={toolbar.italic.handler}
                  shortcut={toolbar.italic.shortcut}
                >
                  {icons.ToolbarItalic}
                </Toolbar.Button>
              </Toolbar.Group>
              <Toolbar.Separator />
              <Toolbar.Group label={ToolbarToolsGroupLabelMessage}>
                <Toolbar.Button
                  label={ToolbarQuoteButtonLabelMessage}
                  onClick={toolbar.quote.handler}
                  shortcut={toolbar.quote.shortcut}
                >
                  {icons.ToolbarQuote}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarCodeButtonLabelMessage}
                  onClick={toolbar.code.handler}
                  shortcut={toolbar.code.shortcut}
                >
                  {icons.ToolbarCode}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarLinkButtonLabelMessage}
                  onClick={toolbar.link.handler}
                  shortcut={toolbar.link.shortcut}
                >
                  {icons.ToolbarLink}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarUnorderedListButtonLabelMessage}
                  onClick={toolbar.uList.handler}
                  shortcut={toolbar.uList.shortcut}
                >
                  {icons.ToolbarUnorderedList}
                </Toolbar.Button>
                <Toolbar.Button
                  label={ToolbarOrderedListButtonLabelMessage}
                  onClick={toolbar.oList.handler}
                  shortcut={toolbar.oList.shortcut}
                >
                  {icons.ToolbarOrderedList}
                </Toolbar.Button>
              </Toolbar.Group>
            </Toolbar>
          )}
          {!hidePreview && previewSwitchMode === "checkbox" && (
            <div className="preview-switch">
              <input
                type="checkbox"
                id={`${id}-preview-switch`}
                checked={editMode === "preview"}
                onChange={(e) => {
                  handleEditModeChange(
                    e.target.checked ? "preview" : "write",
                    "click",
                  );
                }}
              />
              <label htmlFor={`${id}-preview-switch`}>Preview</label>
            </div>
          )}
        </div>

        <textarea
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="editor-content"
          ref={textareaRef}
          hidden={editMode !== "write"}
          style={textareaStyle}
          {...textareaProps}
        />
        {editMode === "preview" && (
          <div className="editor-content" style={previewStyle} ref={previewRef}>
            <Markdown
              source={
                textareaRef.current?.value || defaultValue || emptyInputMessage
              }
              components={previewComponents}
            />
          </div>
        )}
      </div>
    );
  },
);

export default MarkdownEditor;
