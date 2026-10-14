import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  Heading1, Heading2, Heading3, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Quote, Code2, Minus, Link2, Unlink, Image as ImageIcon,
  Table as TableIcon, Undo2, Redo2,
} from "lucide-react";

interface Props {
  editor: Editor;
  onInsertImage: () => void;
}

export function Toolbar({ editor, onInsertImage }: Props) {
  const Btn = ({
    onClick, active, disabled, title, children,
  }: {
    onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        active ? "bg-accent/15 text-accent" : "text-ink/70 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-1 h-6 w-px bg-line" />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const raw = window.prompt("Link URL (use /path for internal links)", prev ?? "");
    if (raw === null) return; // cancelled
    const url = raw.trim();
    if (url === "") {
      // Empty → remove any link on the current selection/word.
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // Normalise: internal /paths, mailto:/tel: and full URLs pass through;
    // a bare "example.com" (common non-coder input) gets https:// so it isn't
    // treated as a broken relative link.
    const href =
      /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url) ? url : `https://${url}`;
    const target = href.startsWith("/") || href.startsWith("#") ? null : "_blank";
    const linkAttrs = { href, target, rel: "noopener noreferrer" };

    if (editor.state.selection.empty) {
      // No text selected → insert the URL itself as clickable, linked text, so
      // clicking "Link" always produces a working link even without a selection.
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: linkAttrs }] })
        .run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink(linkAttrs).run();
  };

  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-line bg-white/95 px-2 py-1.5 backdrop-blur">
      <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={17} /></Btn>
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></Btn>
      <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Btn>
      <Divider />
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={16} /></Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={16} /></Btn>
      <Divider />
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={17} /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={17} /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
      <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 size={17} /></Btn>
      <Btn title="Horizontal line" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={17} /></Btn>
      <Divider />
      <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 size={16} /></Btn>
      <Btn title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={16} /></Btn>
      <Btn title="Insert image" onClick={onInsertImage}><ImageIcon size={16} /></Btn>
      <Btn title="Insert table" onClick={insertTable}><TableIcon size={16} /></Btn>
      <Divider />
      <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></Btn>
      <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></Btn>
    </div>
  );
}
