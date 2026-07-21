import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditProcedureForm from "@/app/procedures/_components/EditProcedureForm";

type Props = {
  params: { id: string };
};

export default async function EditProcedurePage({ params }: Props) {
  const supabase = createClient();

  const [
    {
      data: { user },
    },
    { data: procedure },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("procedures")
      .select("*")
      .eq("id", params.id)
      .eq("is_deleted", false)
      .single(),
  ]);

  if (!user) redirect("/login");
  if (!procedure) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at");

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">手順書を編集</h1>
      <EditProcedureForm procedure={procedure} categories={categories ?? []} />
    </main>
  );
}
