"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { Markdown } from "tiptap-markdown";
import { useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

type Props = {
  name: string;
  defaultValue?: string;
};

/** tiptap-markdown は Editor["storage"] の型を拡張しないため、必要な形だけ宣言する */
type MarkdownStorage = {
  markdown: { getMarkdown: () => string };
};

function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown();
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-[#2d6a4f] text-white" : "hover:bg-gray-200 text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-gray-50">
      <ToolbarButton
        title="見出し1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="見出し2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="見出し3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="太字"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="斜体"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="箇条書き"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="番号リスト"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="引用"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="コード"
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
      >
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="区切り線"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="表を挿入（3行3列・見出し付き）"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        active={editor.isActive("table")}
      >
        <TableIcon size={16} />
      </ToolbarButton>

      {/* 表の中にカーソルがある時だけ行・列の操作を出す（普段はツールバーを増やさない） */}
      {editor.isActive("table") && (
        <>
          <ToolbarButton
            title="下に行を追加"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <span className="text-xs px-1">行＋</span>
          </ToolbarButton>
          <ToolbarButton
            title="行を削除"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <span className="text-xs px-1">行−</span>
          </ToolbarButton>
          <ToolbarButton
            title="右に列を追加"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <span className="text-xs px-1">列＋</span>
          </ToolbarButton>
          <ToolbarButton
            title="列を削除"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <span className="text-xs px-1">列−</span>
          </ToolbarButton>
          <ToolbarButton
            title="表を削除"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <span className="text-xs px-1 text-red-600">表を削除</span>
          </ToolbarButton>
        </>
      )}
    </div>
  );
}

export default function MarkdownEditor({ name, defaultValue = "" }: Props) {
  const [content, setContent] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(getMarkdown(editor));
    },
  });

  return (
    <div className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#2d6a4f]">
      <input type="hidden" name={name} value={content} />
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
