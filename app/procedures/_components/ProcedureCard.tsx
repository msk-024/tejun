import Link from "next/link";
import type { Procedure, Category } from "@/lib/types";

type Props = {
  procedure: Procedure;
  category: Category | null;
};

export default function ProcedureCard({ procedure, category }: Props) {
  return (
    <Link
      href={`/procedures/${procedure.id}`}
      className="block rounded-lg border border-border bg-white px-4 py-3 hover:border-[#2d6a4f] transition-colors"
    >
      {category && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] mb-1">
          {category.name}
        </span>
      )}
      <p className="font-medium">{procedure.title}</p>
    </Link>
  );
}
