import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Loader2 } from "lucide-react";
import type { EditorView } from "@tiptap/pm/view";
import { ResizableImage } from "./ResizableImage";
import { Toolbar } from "./Toolbar";
import { MediaPickerModal } from "./MediaPickerModal";
import { blocksToDoc, docToBlocks } from "@admin/lib/editor/blocks";
import { uploadImage } from "@admin/services/media";
import type { BlogBlock } from "@admin/types/blog";
import type { MediaItem } from "@admin/types/media";
import "./editor.css";

interface Props {
  value: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
  key?: number;
}

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Underline,
  Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
  ResizableImage,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
];

export function RichTextEditor({ value, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(0); // count of in-flight uploads
  const initial = useRef(blocksToDoc(value)); // snapshot at mount (form is gated behind loading)
  const editorRef = useRef<Editor | null>(null);

  // Upload dropped/pasted image files and insert them at the drop position.
  const handleFiles = useCallback((files: FileList | null | undefined, view: EditorView, event?: DragEvent) => {
    const images = files ? Array.from(files).filter((f) => f.type.startsWith("image/")) : [];
    if (!images.length) return false;
    const pos =
      event && view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos != null
        ? view.posAtCoords({ left: event.clientX, top: event.clientY })!.pos
        : view.state.selection.from;
    (async () => {
      for (const file of images) {
        setUploading((n) => n + 1);
        try {
          const media = await uploadImage(file);
          editorRef.current
            ?.chain()
            .focus()
            .insertContentAt(pos, { type: "image", attrs: { src: media.url, alt: media.alt, caption: media.caption } })
            .run();
        } catch {
          /* surfaced via the picker on manual upload; drop failures are silent */
        } finally {
          setUploading((n) => Math.max(0, n - 1));
        }
      }
    })();
    return true;
  }, []);

  const editor = useEditor({
    extensions,
    content: initial.current,
    editorProps: {
      attributes: { class: "ProseMirror" },
      handlePaste: (view, event) => handleFiles(event.clipboardData?.files, view),
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        return handleFiles((event as DragEvent).dataTransfer?.files, view, event as DragEvent);
      },
    },
    onUpdate: ({ editor }) => onChange(docToBlocks(editor.getJSON())),
  });
  editorRef.current = editor;

  const insertFromLibrary = (m: MediaItem) => {
    editor?.chain().focus().setResizableImage({ src: m.url, alt: m.alt, caption: m.caption }).run();
  };

  if (!editor) return null;

  return (
    <div className="blog-editor overflow-hidden rounded-2xl border border-line bg-white">
      <Toolbar editor={editor} onInsertImage={() => setPickerOpen(true)} />
      <div className="relative">
        <EditorContent editor={editor} />
        {uploading > 0 && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper shadow">
            <Loader2 size={13} className="animate-spin" /> Uploading {uploading} image{uploading > 1 ? "s" : ""}…
          </div>
        )}
      </div>
      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={insertFromLibrary} />
    </div>
  );
}
