import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { isSuperAdmin } from "@/lib/superadmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; webhookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, webhookId } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== session.user.id && !isSuperAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, projectId: project.id },
  });

  if (!webhook) {
    return Response.json({ error: "Webhook not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, url, method, headers, enabled, content, eventType } = body;

  const updated = await prisma.webhook.update({
    where: { id: webhookId },
    data: {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(method !== undefined && { method }),
      ...(headers !== undefined && { headers }),
      ...(enabled !== undefined && { enabled }),
      ...(content !== undefined && { content }),
      ...(eventType !== undefined && { eventType }),
    },
  });

  return Response.json({ webhook: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; webhookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, webhookId } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== session.user.id && !isSuperAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, projectId: project.id },
  });

  if (!webhook) {
    return Response.json({ error: "Webhook not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id: webhookId } });

  return Response.json({ success: true });
}
