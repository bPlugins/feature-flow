"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface UpvoteButtonProps {
  feedbackId: string;
  initialCount: number;
  initialUpvoted?: boolean;
  size?: "sm" | "md";
}

export default function UpvoteButton({
  feedbackId,
  initialCount,
  initialUpvoted = false,
  size = "md",
}: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(initialUpvoted);
  const [loading, setLoading] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/feedback/${feedbackId}/upvote`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setCount(data.upvoteCount);
        setUpvoted(data.upvoted);
      } else {
        toast.error(data.error || "Failed to upvote");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === "sm"
    ? "px-2 py-1 text-xs gap-0.5 min-w-[40px]"
    : "px-3 py-2 text-sm gap-1 min-w-[52px]";

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={`
        inline-flex flex-col items-center justify-center rounded-xl
        font-semibold transition-all duration-200
        ${sizeClasses}
        ${
          upvoted
            ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
            : "bg-surface border border-border hover:border-primary/50 hover:bg-primary-light hover:text-primary-dark text-muted-foreground"
        }
        ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}
        active:scale-95
      `}
      aria-label={upvoted ? "Remove upvote" : "Upvote"}
    >
      <ChevronUp className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{count}</span>
    </button>
  );
}
