import { notFound } from "next/navigation";

import { DocRow } from "@/components/workspace/doc-row";
import { WORKSPACES, getWorkspace, getDocs } from "@/lib/data";

export function generateStaticParams() {
  return WORKSPACES.map((ws) => ({ id: ws.id }));
}

export default async function Page({ params }: PageProps<"/w/[id]">) {
  const { id } = await params;
  const workspace = getWorkspace(id);

  if (!workspace) notFound();

  const docs = getDocs(id);

  return (
    <section className="divide-y divide-border/60">
      {docs.map((doc) => (
        <DocRow
          key={doc.id}
          doc={doc}
          members={workspace.members}
          workspaceId={workspace.id}
        />
      ))}
    </section>
  );
}
