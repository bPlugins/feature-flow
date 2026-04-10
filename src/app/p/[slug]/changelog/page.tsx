import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Sparkles, Bug, Zap, AlertTriangle } from "lucide-react";

const typeConfig: Record<string, { icon: typeof Sparkles; color: string; label: string }> = {
  feature: { icon: Sparkles, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/30", label: "Feature" },
  improvement: { icon: Zap, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30", label: "Improvement" },
  bugfix: { icon: Bug, color: "text-red-500 bg-red-100 dark:bg-red-900/30", label: "Bug Fix" },
  breaking: { icon: AlertTriangle, color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30", label: "Breaking" },
};

export default async function PublicChangelogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      changelogs: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold">Changelog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All the latest updates, improvements, and fixes
        </p>
      </div>

      {project.changelogs.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-border bg-surface text-center">
          <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
          <p className="text-muted-foreground text-sm">
            Check back soon for product updates and announcements.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[17px] top-8 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-8">
            {project.changelogs.map((entry, i) => {
              const config = typeConfig[entry.type] || typeConfig.feature;
              const Icon = config.icon;
              return (
                <div
                  key={entry.id}
                  className="relative flex gap-6 animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="p-6 rounded-2xl border border-border bg-surface hover:border-primary/20 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                        {entry.version && (
                          <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">
                            v{entry.version}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {entry.publishedAt
                            ? format(new Date(entry.publishedAt), "MMM d, yyyy")
                            : ""}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3">{entry.title}</h3>

                      <div className="prose-content text-sm text-muted-foreground">
                        <ReactMarkdown>{entry.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
