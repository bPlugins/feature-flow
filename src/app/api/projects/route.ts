import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: {
          feedbacks: true,
          roadmapItems: true,
          changelogs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, websiteUrl } = body;

  if (!name) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }

  // Generate slug from name
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check for existing slug and make unique
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const project = await prisma.project.create({
    data: {
      name,
      slug,
      description: description || null,
      websiteUrl: websiteUrl || null,
      ownerId: session.user.id,
      boards: {
        create: [
          { name: "Feature Requests", slug: "feature-requests", position: 0 },
          { name: "Bug Reports", slug: "bug-reports", position: 1 },
          { name: "Improvements", slug: "improvements", position: 2 },
        ],
      },
    },
    include: {
      boards: true,
    },
  });

  return Response.json({ project }, { status: 201 });
}
