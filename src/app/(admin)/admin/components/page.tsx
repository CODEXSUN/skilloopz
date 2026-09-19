import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminComponentsPage() {
  const blocks = await prisma.blockDefinition.findMany({
    orderBy: { type: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Components</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered block types available across the platform.
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No components registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Label</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Scope</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blocks.map((block) => (
                <tr key={block.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{block.type}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{block.label}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {block.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{block.scope}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{block.category}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
