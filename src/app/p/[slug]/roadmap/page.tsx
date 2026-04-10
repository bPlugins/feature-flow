import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicRoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      roadmapItems: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        include: {
          feedback: {
            select: { id: true, title: true, upvoteCount: true },
          },
        },
      },
    },
  });

  if (!project) notFound();

  const columns = [
    { status: "planned", title: "🎯 Planned", color: "border-t-blue-400", bgBadge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { status: "in_progress", title: "🚧 In Progress", color: "border-t-amber-400", bgBadge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
    { status: "completed", title: "✅ Completed", color: "border-t-emerald-400", bgBadge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Roadmap</h1>
        <p className="text-muted-foreground text-sm mt-1">
          See what we&apos;re working on and what&apos;s coming next
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const items = project.roadmapItems.filter((i) => i.status === col.status);
          return (
            <div key={col.status} className={`rounded-2xl border border-border bg-surface border-t-4 ${col.color}`}>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold">{col.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${col.bgBadge}`}>
                  {items.length}
                </span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border bg-background hover:border-primary/20 transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.quarter && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          {item.quarter}
                        </span>
                      )}
                      {item.feedback && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          ▲ {item.feedback.upvoteCount} votes
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground/40">
                    Nothing here yet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
