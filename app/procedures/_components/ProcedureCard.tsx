import Link from 'next/link'
import type { Procedure, Category } from '@/lib/types'

type Props = {
  procedure: Procedure
  category: Category | null
}

export default function ProcedureCard({ procedure, category }: Props) {
  const excerpt = procedure.content.replace(/[#*`>\-\n]/g, ' ').trim().slice(0, 80)

  return (
    <Link
      href={`/procedures/${procedure.id}`}
      className="block rounded-lg border border-border bg-white px-4 py-3 hover:border-[#2d6a4f] transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        {category && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f]">
            {category.name}
          </span>
        )}
      </div>
      <p className="font-medium">{procedure.title}</p>
      {excerpt && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{excerpt}</p>
      )}
    </Link>
  )
}
