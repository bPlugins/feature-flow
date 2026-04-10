import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.changelogEntry.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!entry || entry.project.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, version, type, isPublished } = body;

  const updated = await prisma.changelogEntry.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      ...(version !== undefined && { version }),
      ...(type && { type }),
      ...(isPublished !== undefined && {
        isPublished,
        publishedAt: isPublished && !entry.publishedAt ? new Date() : entry.publishedAt,
      }),
    },
  });

  return Response.json({ changelog: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const entry = await prisma.changelogEntry.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!entry || entry.project.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.changelogEntry.delete({ where: { id } });
  return Response.json({ success: true });
}
