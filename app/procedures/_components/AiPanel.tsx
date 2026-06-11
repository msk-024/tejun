'use client'

import { useState, useTransition, useRef, useEffect } from 'react'

type Message = {
  question: string
  answer: string
}

export default function AiPanel() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (!q) return
    setQuestion('')

    startTransition(async () => {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const { answer } = await res.json()
      setMessages((prev) => [...prev, { question: q, answer }])
    })
  }

  return (
    <div className="border border-border rounded-lg flex flex-col bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-[#2d6a4f]/5">
        <h2 className="text-sm font-semibold text-[#2d6a4f]">AI に質問する</h2>
        <p className="text-xs text-muted-foreground mt-0.5">この手順書についてAIに質問できます</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-[12rem] max-h-[28rem]">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            質問を入力してください
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="self-end bg-[#2d6a4f] text-white text-xs rounded-xl rounded-tr-sm px-3 py-2 max-w-[90%]">
              {msg.question}
            </div>
            <div className="self-start bg-gray-100 text-foreground text-xs rounded-xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              {msg.answer}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="self-start bg-gray-100 text-muted-foreground text-xs rounded-xl rounded-tl-sm px-3 py-2">
            考え中…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-3 flex gap-2">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
          placeholder="質問を入力（Enter で送信）"
          rows={2}
          disabled={isPending}
          className="flex-1 resize-none text-xs border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !question.trim()}
          className="self-end shrink-0 bg-[#2d6a4f] text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#255c43] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </form>
    </div>
  )
}
