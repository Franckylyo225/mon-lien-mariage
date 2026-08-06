import { useCallback, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  IconBold,
  IconItalic,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconPhoto,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconClearFormatting,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { uploadBlogImage } from "@/lib/blog-upload";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function Btn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addLink = useCallback(() => {
    const previous = editor.getAttributes("link")["href"] as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  async function handleFile(file: File) {
    const toastId = toast.loading("Envoi de l'image…");
    try {
      const url = await uploadBlogImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image insérée", { id: toastId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible", { id: toastId });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 bg-neutral-50 px-2 py-1.5">
      <Btn
        title="Gras"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold size={16} />
      </Btn>
      <Btn
        title="Italique"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic size={16} />
      </Btn>
      <span className="mx-1 h-4 w-px bg-border" />
      <Btn
        title="Titre 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 size={16} />
      </Btn>
      <Btn
        title="Titre 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 size={16} />
      </Btn>
      <span className="mx-1 h-4 w-px bg-border" />
      <Btn
        title="Liste à puces"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconList size={16} />
      </Btn>
      <Btn
        title="Liste numérotée"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListNumbers size={16} />
      </Btn>
      <Btn
        title="Citation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote size={16} />
      </Btn>
      <span className="mx-1 h-4 w-px bg-border" />
      <Btn title="Lien" active={editor.isActive("link")} onClick={addLink}>
        <IconLink size={16} />
      </Btn>
      <Btn title="Insérer une image" onClick={() => fileRef.current?.click()}>
        <IconPhoto size={16} />
      </Btn>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void handleFile(f);
        }}
      />
      <span className="mx-1 h-4 w-px bg-border" />
      <Btn
        title="Effacer la mise en forme"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        <IconClearFormatting size={16} />
      </Btn>
      <div className="ml-auto flex items-center gap-0.5">
        <Btn title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
          <IconArrowBackUp size={16} />
        </Btn>
        <Btn title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
          <IconArrowForwardUp size={16} />
        </Btn>
      </div>
    </div>
  );
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose-editor min-h-[320px] max-h-[55vh] overflow-y-auto px-4 py-3 text-[15px] leading-[1.7] outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  if (!editor) {
    return (
      <div className="min-h-[360px] rounded-md border border-border/70 bg-white p-4 text-sm text-muted-foreground">
        Chargement de l'éditeur…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-white focus-within:border-primary/60">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
