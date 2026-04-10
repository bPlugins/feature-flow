import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const publishedOnly = searchParams.get("published") !== "false";

  const project = await prisma.project.findUnique({ where: { slug } });
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const where: Record<string, unknown> = { projectId: project.id };
  if (publishedOnly) where.isPublished = true;

  const changelogs = await prisma.changelogEntry.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });

  return Response.json({ changelogs });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project || project.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, version, type = "feature", isPublished = false } = body;

  if (!title || !content) {
    return Response.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.changelogEntry.create({
    data: {
      title,
      content,
      version: version || null,
      type,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      projectId: project.id,
    },
  });

  return Response.json({ changelog: entry }, { status: 201 });
}
