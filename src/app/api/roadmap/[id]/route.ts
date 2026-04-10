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
  const item = await prisma.roadmapItem.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!item || item.project.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, status, quarter, position, eta } = body;

  const updated = await prisma.roadmapItem.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && {
        status,
        ...(status === "completed" && { completedAt: new Date() }),
      }),
      ...(quarter !== undefined && { quarter }),
      ...(position !== undefined && { position }),
      ...(eta !== undefined && { eta: eta ? new Date(eta) : null }),
    },
  });

  return Response.json({ roadmapItem: updated });
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
  const item = await prisma.roadmapItem.findUnique({
    where: { id },
    include: { project: true },
  });

  if (!item || item.project.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.roadmapItem.delete({ where: { id } });
  return Response.json({ success: true });
}
