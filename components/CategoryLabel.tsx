"use client";

import { useCategoryLabel } from "@/hooks/useCategories";

export default function CategoryLabel({ slug }: { slug: string }) {
  const label = useCategoryLabel(slug);
  return <>{label}</>;
}
