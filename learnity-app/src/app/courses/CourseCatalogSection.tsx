import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { courseService } from "@/lib/services/course.service";
import CourseCatalogClient from "./CourseCatalogClient";

/**
 * Shared logic for categories and courses data fetching
 */

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true },
  });
}

async function getCoursesData(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const limit = 12;

  const filters = {
    categoryId:
      typeof searchParams.categoryId === "string"
        ? searchParams.categoryId
        : undefined,
    difficulty:
      typeof searchParams.difficulty === "string"
        ? (searchParams.difficulty as any)
        : undefined,
    minRating:
      typeof searchParams.minRating === "string"
        ? parseFloat(searchParams.minRating)
        : undefined,
    sortBy:
      typeof searchParams.sortBy === "string"
        ? (searchParams.sortBy as any)
        : "popular",
    page,
    limit,
  };

  const courseResult = search
    ? await courseService.searchCourses(search, filters)
    : await courseService.getPublishedCourses(filters);

  return {
    courses: courseResult.courses.map((c: any) => ({
      ...c,
      price: c.price ? Number(c.price) : null,
      averageRating: c.averageRating ? Number(c.averageRating) : 0,
      teacher: {
        ...c.teacher,
        name: `${c.teacher.firstName || ""} ${c.teacher.lastName || ""}`.trim(),
        avatarUrl: c.teacher.profilePicture,
      },
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      publishedAt: c.publishedAt?.toISOString() || null,
    })),
    total: courseResult.total,
    totalPages: courseResult.totalPages,
  };
}

/**
 * Reusable Course Catalog Section
 */

interface CourseCatalogSectionProps {
  searchParams:
    | { [key: string]: string | string[] | undefined }
    | Promise<{ [key: string]: string | string[] | undefined }>;
  basePath?: string;
}

export async function CourseCatalogSection({
  searchParams,
  basePath,
}: CourseCatalogSectionProps) {
  const sParams =
    searchParams instanceof Promise ? await searchParams : searchParams || {};

  const categoriesPromise = getCategories();
  const courseDataPromise = getCoursesData(sParams);

  return (
    <Suspense fallback={<CatalogGridSkeleton />}>
      <CatalogContent
        categoriesPromise={categoriesPromise}
        courseDataPromise={courseDataPromise}
        basePath={basePath}
      />
    </Suspense>
  );
}

async function CatalogContent({
  categoriesPromise,
  courseDataPromise,
  basePath,
}: {
  categoriesPromise: Promise<any[]>;
  courseDataPromise: Promise<any>;
  basePath?: string;
}) {
  const [categories, courseData] = await Promise.all([
    categoriesPromise,
    courseDataPromise,
  ]);

  return (
    <CourseCatalogClient
      initialCourses={courseData.courses}
      initialCategories={categories}
      initialTotal={courseData.total}
      initialTotalPages={courseData.totalPages}
      basePath={basePath}
    />
  );
}

function CatalogGridSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-[4/5] rounded-[2.5rem] bg-slate-50 border border-slate-100"
          />
        ))}
      </div>
    </div>
  );
}
