import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  MessageSquare,
  Map,
  FileText,
  TrendingUp,
  ChevronUp,
  ArrowRight,
  Plus,
  FolderOpen,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const projects = await prisma.project.findMany({
    where: { ownerId: userId! },
    include: {
      _count: {
        select: {
          feedbacks: true,
          roadmapItems: true,
          changelogs: true,
        },
      },
      feedbacks: {
        orderBy: { upvoteCount: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          upvoteCount: true,
          status: true,
          category: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalFeedback = projects.reduce((sum, p) => sum + p._count.feedbacks, 0);
  const totalRoadmap = projects.reduce((sum, p) => sum + p._count.roadmapItems, 0);
  const totalChangelogs = projects.reduce((sum, p) => sum + p._count.changelogs, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Projects", value: projects.length, icon: FolderOpen, color: "text-primary" },
          { label: "Total Feedback", value: totalFeedback, icon: MessageSquare, color: "text-blue-500" },
          { label: "Roadmap Items", value: totalRoadmap, icon: Map, color: "text-purple-500" },
          { label: "Changelogs", value: totalChangelogs, icon: FileText, color: "text-cyan-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl border border-border bg-surface hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Your Projects</h2>
          <Link
            href="/dashboard/new-project"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border bg-surface text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first project to start collecting feedback from your users.
            </p>
            <Link
              href="/dashboard/new-project"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 stagger-children">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group p-6 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      /{project.slug}
                    </p>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.primaryColor }}
                  />
                </div>

                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {project._count.feedbacks}
                  </span>
                  <span className="flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    {project._count.roadmapItems}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {project._count.changelogs}
                  </span>
                </div>

                {/* Top feedback */}
                {project.feedbacks.length > 0 && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Top Feedback
                    </p>
                    {project.feedbacks.slice(0, 3).map((fb) => (
                      <div key={fb.id} className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-0.5 text-xs text-primary font-medium min-w-[32px]">
                          <ChevronUp className="w-3 h-3" />
                          {fb.upvoteCount}
                        </span>
                        <span className="truncate">{fb.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/dashboard/feedback?project=${project.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover mt-4 transition-colors"
                >
                  Manage
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
