"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = {
  id: string;
  name: string;
};

type TestimonialFiltersProps = {
  projectId: string;
  categories: CategoryOption[];
  initialStatus: string;
  initialCategoryId: string;
};

export function TestimonialFilters({
  projectId,
  categories,
  initialStatus,
  initialCategoryId,
}: TestimonialFiltersProps) {
  const router = useRouter();
  const statusValue = initialStatus || "all";
  const categoryValue = initialCategoryId || "all";

  function applyFilters(formData: FormData) {
    const statusRaw = String(formData.get("status") || "");
    const categoryRaw = String(formData.get("categoryId") || "");
    const status = statusRaw === "all" ? "" : statusRaw;
    const categoryId = categoryRaw === "all" ? "" : categoryRaw;

    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (categoryId) query.set("categoryId", categoryId);

    const queryString = query.toString();
    router.push(
      queryString
        ? `/dashboard/projects/${projectId}/testimonials?${queryString}`
        : `/dashboard/projects/${projectId}/testimonials`
    );
  }

  return (
    <form action={applyFilters} className="grid gap-3 sm:grid-cols-3">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={statusValue}>
          <SelectTrigger id="status" className="mt-1 w-full">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" defaultValue={categoryValue}>
          <SelectTrigger id="categoryId" className="mt-1 w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end gap-2">
        <Button type="submit">Apply filters</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/projects/${projectId}/testimonials`)}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
