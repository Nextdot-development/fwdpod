import type { PointerEvent as ReactPointerEvent } from "react";
import { useRef } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";

/**
 * Block image node with editable ALT + caption and drag-to-resize width.
 * Attributes are plain data (src/alt/caption/width) so the node serialises
 * cleanly into the BlogBlock `image` shape.
 */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setResizableImage: (attrs: { src: string; alt?: string; caption?: string; width?: number | null }) => ReturnType;
    };
  }
}

function ImageView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { src, alt, caption, width } = node.attrs as {
    src: string;
    alt: string;
    caption: string;
    width: number | null;
  };

  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault();
    const container = wrapRef.current;
    const img = container?.querySelector("img");
    if (!img || !container) return;
    const startX = e.clientX;
    const startWidth = img.getBoundingClientRect().width;
    const maxWidth = container.getBoundingClientRect().width;
    const onMove = (ev: PointerEvent) => {
      const next = Math.round(Math.min(maxWidth, Math.max(80, startWidth + (ev.clientX - startX))));
      updateAttributes({ width: next });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <NodeViewWrapper className="my-5">
      <div ref={wrapRef} className="flex flex-col items-center">
        <div
          className={`group relative inline-block max-w-full rounded-xl border ${
            selected ? "border-accent ring-2 ring-accent/30" : "border-line"
          }`}
          style={{ width: width ? `${width}px` : "100%" }}
        >
          {src ? (
            <img src={src} alt={alt || ""} className="block h-auto w-full rounded-xl" draggable={false} />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-surface text-sm text-ink/40">
              No image source
            </div>
          )}

          {/* delete button */}
          <button
            type="button"
            onClick={() => deleteNode()}
            title="Delete image"
            className="absolute right-2 top-2 hidden rounded-full bg-ink/80 p-1.5 text-paper hover:bg-ink group-hover:block"
          >
            <Trash2 size={14} />
          </button>

          {/* resize handle */}
          <span
            onPointerDown={startResize}
            title="Drag to resize"
            className="absolute -right-1 bottom-1/2 h-10 w-2.5 translate-y-1/2 cursor-ew-resize rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>

        <input
          value={alt ?? ""}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
          placeholder="ALT text (describe the image for accessibility & SEO)"
          className="mt-2 w-full max-w-xl rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
        />
        <input
          value={caption ?? ""}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Caption (optional — shown under the image)"
          className="mt-1.5 w-full max-w-xl rounded-md border border-line bg-white px-2.5 py-1.5 text-center text-xs italic text-ink/70 placeholder:not-italic placeholder:text-ink/40 focus:border-accent focus:outline-none"
        />
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      width: {
        default: null,
        parseHTML: (el) => {
          const w = (el as HTMLElement).getAttribute("width");
          return w ? Number(w) : null;
        },
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },

  addCommands() {
    return {
      setResizableImage:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
