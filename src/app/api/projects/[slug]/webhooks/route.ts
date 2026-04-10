import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { isSuperAdmin } from "@/lib/superadmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== session.user.id && !isSuperAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ webhooks });
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

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== session.user.id && !isSuperAdmin(session.user.email)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, url, method, headers, enabled, content, eventType } = body;

  if (!name || !url) {
    return Response.json({ error: "Name and URL are required" }, { status: 400 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      projectId: project.id,
      name,
      url,
      method: method || "POST",
      headers: headers || null,
      enabled: enabled !== false,
      content: content || null,
      eventType: eventType || "feedback.created",
    },
  });

  return Response.json({ webhook }, { status: 201 });
}
