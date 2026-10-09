import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { CategoryList } from "@/features/categories/category-list";
import { NewCategoryForm } from "@/features/categories/new-category-form";
import { listCategories } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Categories · FocusTrack" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <PageHeader
        title="Categories"
        description="The kind of work a session is. Kind decides whether time counts as execution or preparation."
      />
      <NewCategoryForm />
      <CategoryList categories={categories} />
    </main>
  );
}
