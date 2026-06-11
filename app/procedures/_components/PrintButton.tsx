'use client'

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print text-sm px-3 py-1.5 rounded-md border border-border hover:bg-gray-50 transition-colors"
    >
      印刷
    </button>
  )
}
