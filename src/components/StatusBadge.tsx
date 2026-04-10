"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusLabels: Record<string, string> = {
  open: "Open",
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  closed: "Closed",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        status-${status} ${sizeClasses}
      `}
    >
      {statusLabels[status] || status}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

const categoryLabels: Record<string, string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  question: "Question",
};

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        category-${category} ${sizeClasses}
      `}
    >
      {categoryLabels[category] || category}
    </span>
  );
}
