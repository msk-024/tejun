'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import { useState } from 'react'
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
} from 'lucide-react'
import type { Editor } from '@tiptap/react'

type Props = {
  name: string
  defaultValue?: string
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-[#2d6a4f] text-white' : 'hover:bg-gray-200 text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-gray-50">
      <ToolbarButton
        title="見出し1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="見出し2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="見出し3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="太字"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="斜体"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
      >
        <Italic size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="箇条書き"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="番号リスト"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      <ToolbarButton
        title="引用"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="コード"
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
      >
        <Code size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="区切り線"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={16} />
      </ToolbarButton>
    </div>
  )
}

export default function MarkdownEditor({ name, defaultValue = '' }: Props) {
  const [content, setContent] = useState(defaultValue)

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // tiptap-markdown は Storage 型を拡張しないため型アサーションが必要
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as unknown as Record<string, any>).markdown.getMarkdown() as string
      setContent(md)
    },
  })

  return (
    <div className="border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#2d6a4f]">
      <input type="hidden" name={name} value={content} />
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
