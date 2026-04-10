import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { createHash } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) {
    return Response.json({ error: "Feedback not found" }, { status: 404 });
  }

  // For anonymous upvotes, use IP-based fingerprint
  let anonymousId: string | null = null;
  if (!session?.user?.id) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    anonymousId = createHash("sha256").update(`${ip}-${id}`).digest("hex").slice(0, 16);
  }

  // Check if already upvoted
  const existingUpvote = session?.user?.id
    ? await prisma.upvote.findUnique({
        where: { feedbackId_userId: { feedbackId: id, userId: session.user.id } },
      })
    : anonymousId
    ? await prisma.upvote.findUnique({
        where: { feedbackId_anonymousId: { feedbackId: id, anonymousId } },
      })
    : null;

  if (existingUpvote) {
    // Remove upvote (toggle off)
    await prisma.upvote.delete({ where: { id: existingUpvote.id } });
    await prisma.feedback.update({
      where: { id },
      data: { upvoteCount: { decrement: 1 } },
    });
    return Response.json({ upvoted: false, upvoteCount: feedback.upvoteCount - 1 });
  }

  // Add upvote
  await prisma.upvote.create({
    data: {
      feedbackId: id,
      userId: session?.user?.id || null,
      anonymousId: session?.user?.id ? null : anonymousId,
    },
  });

  await prisma.feedback.update({
    where: { id },
    data: { upvoteCount: { increment: 1 } },
  });

  return Response.json({ upvoted: true, upvoteCount: feedback.upvoteCount + 1 });
}
