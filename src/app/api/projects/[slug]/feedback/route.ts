import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "newest";
  const boardSlug = searchParams.get("board");

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { boards: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const where: Record<string, unknown> = { projectId: project.id };
  if (status) where.status = status;
  if (category) where.category = category;
  if (boardSlug) {
    const board = project.boards.find((b) => b.slug === boardSlug);
    if (board) where.boardId = board.id;
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "most_voted") orderBy = { upvoteCount: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const feedbacks = await prisma.feedback.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      board: { select: { name: true, slug: true } },
      _count: { select: { comments: true, upvotes: true } },
    },
    orderBy,
  });

  return Response.json({ feedbacks });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();

  const project = await prisma.project.findUnique({
    where: { slug },
    include: { boards: true },
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, category = "feature", boardSlug, authorName, authorEmail } = body;

  if (!title || !description) {
    return Response.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const boardId = boardSlug
    ? project.boards.find((b) => b.slug === boardSlug)?.id
    : project.boards[0]?.id;

  const feedback = await prisma.feedback.create({
    data: {
      title,
      description,
      category,
      projectId: project.id,
      authorId: session?.user?.id || null,
      boardId: boardId || null,
      authorName: session?.user?.name || authorName || "Anonymous",
      authorEmail: (session?.user as { email?: string })?.email || authorEmail || null,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      board: { select: { name: true, slug: true } },
    },
  });

  return Response.json({ feedback }, { status: 201 });
}
