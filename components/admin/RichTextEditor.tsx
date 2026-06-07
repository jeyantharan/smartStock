"use client";

import React, { useRef, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const PRESET_COLORS = [
  "#212529",
  "#dc3545",
  "#fd7e14",
  "#198754",
  "#0d6efd",
  "#6f42c1",
  "#6c757d",
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string | null>(null);

  useEffect(() => {
    if (editorRef.current && value !== lastHtml.current) {
      editorRef.current.innerHTML = value || "";
      lastHtml.current = value;
    }
  }, [value]);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML ?? "";
    lastHtml.current = html;
    onChange(html);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleLink = () => {
    const url = window.prompt("Enter the link URL (include https://)");
    if (url) exec("createLink", url);
  };

  return (
    <div className="rte border rounded">
      <div className="rte-toolbar d-flex flex-wrap align-items-center gap-1 p-2 border-bottom bg-light">
        <ToolbarButton title="Bold" icon="bi-type-bold" onClick={() => exec("bold")} />
        <ToolbarButton title="Italic" icon="bi-type-italic" onClick={() => exec("italic")} />
        <ToolbarButton title="Underline" icon="bi-type-underline" onClick={() => exec("underline")} />
        <ToolbarButton
          title="Strikethrough"
          icon="bi-type-strikethrough"
          onClick={() => exec("strikeThrough")}
        />

        <span className="rte-divider" />

        <ToolbarButton title="Align left" icon="bi-text-left" onClick={() => exec("justifyLeft")} />
        <ToolbarButton title="Align center" icon="bi-text-center" onClick={() => exec("justifyCenter")} />
        <ToolbarButton title="Align right" icon="bi-text-right" onClick={() => exec("justifyRight")} />
        <ToolbarButton title="Justify" icon="bi-justify" onClick={() => exec("justifyFull")} />

        <span className="rte-divider" />

        <ToolbarButton title="Heading" icon="bi-type-h2" onClick={() => exec("formatBlock", "<h3>")} />
        <ToolbarButton title="Paragraph" icon="bi-paragraph" onClick={() => exec("formatBlock", "<p>")} />
        <ToolbarButton title="Bulleted list" icon="bi-list-ul" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton title="Numbered list" icon="bi-list-ol" onClick={() => exec("insertOrderedList")} />
        <ToolbarButton title="Add link" icon="bi-link-45deg" onClick={handleLink} />

        <span className="rte-divider" />

        <div className="d-flex align-items-center gap-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="rte-swatch"
              style={{ backgroundColor: color }}
              title={`Text color ${color}`}
              onMouseDown={(e) => {
                e.preventDefault();
                exec("foreColor", color);
              }}
            />
          ))}
          <label className="rte-swatch rte-swatch-custom mb-0" title="Custom color">
            <i className="bi bi-eyedropper" />
            <input
              type="color"
              className="rte-color-input"
              onChange={(e) => exec("foreColor", e.target.value)}
            />
          </label>
        </div>

        <span className="rte-divider" />

        <ToolbarButton
          title="Clear formatting"
          icon="bi-eraser"
          onClick={() => exec("removeFormat")}
        />
      </div>

      <div
        ref={editorRef}
        className="rte-content form-control border-0"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />

      <style jsx>{`
        .rte {
          overflow: hidden;
        }
        .rte-divider {
          width: 1px;
          align-self: stretch;
          background: var(--gray-border, #dee2e6);
          margin: 0 0.25rem;
        }
        .rte-content {
          min-height: 160px;
          max-height: 360px;
          overflow-y: auto;
          border-radius: 0;
          box-shadow: none !important;
        }
        .rte-content:focus {
          outline: none;
        }
        .rte-content:empty::before {
          content: attr(data-placeholder);
          color: #adb5bd;
          pointer-events: none;
        }
        .rte-swatch {
          width: 22px;
          height: 22px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          padding: 0;
          cursor: pointer;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .rte-swatch-custom {
          background: #fff;
          color: #6c757d;
          font-size: 0.7rem;
          overflow: hidden;
        }
        .rte-color-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="btn btn-sm btn-light border d-inline-flex align-items-center justify-content-center"
      style={{ width: 32, height: 32, padding: 0 }}
      title={title}
      aria-label={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <i className={`bi ${icon}`} />
    </button>
  );
}
