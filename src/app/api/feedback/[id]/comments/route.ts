import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { feedbackId: id },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!feedback) {
    return Response.json({ error: "Feedback not found" }, { status: 404 });
  }

  const body = await request.json();
  const { content, authorName } = body;

  if (!content) {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }

  const isOfficial = session?.user?.id === feedback.project.ownerId;

  const comment = await prisma.comment.create({
    data: {
      content,
      feedbackId: id,
      authorId: session?.user?.id || null,
      isOfficial,
      authorName: session?.user?.name || authorName || "Anonymous",
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return Response.json({ comment }, { status: 201 });
}
