import type { Metadata } from "next";
import { CategoryList } from "@/features/categories/category-list";
import { NewCategoryForm } from "@/features/categories/new-category-form";
import { listCategories } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Categories · FocusTrack" };

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          The kind of work a session is. Kind decides whether time counts as
          execution or preparation.
        </p>
      </div>
      <NewCategoryForm />
      <CategoryList categories={categories} />
    </main>
  );
}
