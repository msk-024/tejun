'use client'

import { useState } from 'react'
import { createProcedure } from '@/app/procedures/actions'
import MarkdownEditor from './MarkdownEditor'
import { PROCEDURE_TEMPLATES } from './templates'
import type { Category } from '@/lib/types'

type Props = {
  categories: Category[]
}

export default function NewProcedureForm({ categories }: Props) {
  const [editorKey, setEditorKey] = useState(0)
  const [defaultContent, setDefaultContent] = useState('')

  function handleTemplateSelect(content: string) {
    setDefaultContent(content)
    setEditorKey((k) => k + 1)
  }

  return (
    <form action={createProcedure} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md border border-border">
        <p className="text-xs font-medium text-muted-foreground">テンプレートから始める（任意）</p>
        <div className="flex flex-wrap gap-2">
          {PROCEDURE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleTemplateSelect(template.content)}
              className="text-xs px-3 py-1.5 rounded-md border border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/10 transition-colors"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category_id" className="text-sm font-medium">
          カテゴリ
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue=""
          className="border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
        >
          <option value="">カテゴリなし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">本文</label>
        <MarkdownEditor key={editorKey} name="content" defaultValue={defaultContent} />
      </div>

      <div>
        <button
          type="submit"
          className="bg-[#2d6a4f] text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-[#255c43] transition-colors"
        >
          作成する
        </button>
      </div>
    </form>
  )
}
