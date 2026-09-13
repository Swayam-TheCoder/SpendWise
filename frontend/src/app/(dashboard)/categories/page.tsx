"use client";

import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/services/category.service";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    icon: "🍔",
    color: "#F97316",
  });

  const categoryIcons = [
    "🍔",
    "🚗",
    "🛍️",
    "🏠",
    "💡",
    "🎮",
    "💻",
    "✈️",
    "🏥",
    "📚",
    "💰",
    "📦",
  ];

  const categoryColors = [
    "#F97316",
    "#3B82F6",
    "#EC4899",
    "#8B5CF6",
    "#22C55E",
    "#EAB308",
    "#EF4444",
    "#06B6D4",
  ];

  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: form.name.trim(),
          icon: form.icon,
          color: form.color,
        });
      } else {
        await createCategory({
          name: form.name.trim(),
          icon: form.icon,
          color: form.color,
        });
      }

      setForm({
        name: "",
        icon: "🍔",
        color: "#F97316",
      });

      setEditingCategory(null);
      setShowCreate(false);

      await loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    setDeletingCategory(category);
    setDeleteError(null);

    try {
      await deleteCategory(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      setDeletingCategory(null);
    } catch (error: any) {
      console.error("Failed to delete category:", error);

      if (error?.response?.status === 409) {
        setDeleteError(
          "This category is being used by one or more expenses. Move those expenses to another category before deleting it.",
        );
      } else {
        setDeleteError("Unable to delete this category.");
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return <div className="p-8 text-white/50">Loading categories...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
          <h1 className="text-2xl font-semibold text-white">Categories</h1>

          <p className="mt-1 text-sm text-white/40">Organize your expenses</p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
        >
          + Add Category
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.045]"
          >
            {/* Color accent */}
            <div
              className="absolute left-0 top-0 h-full w-1"
              style={{
                backgroundColor: category.color || "#6366f1",
              }}
            />

            <div className="flex min-w-0 items-start justify-between gap-3">
              {/* Icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                style={{
                  backgroundColor: `${category.color || "#6366f1"}20`,
                }}
              >
                {category.icon || "📁"}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white"
                  title="Edit category"
                  onClick={() => {
                    setEditingCategory(category);

                    setForm({
                      name: category.name,
                      icon: category.icon || "📁",
                      color: category.color || "#6366f1",
                    });

                    setShowCreate(true);
                  }}
                >
                  ✎
                </button>

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/35 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete category"
                  onClick={() => handleDelete(category)}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-5">
              <h3 className="font-medium text-white">{category.name}</h3>

              <p className="mt-1 text-xs text-white/35">Expense category</p>
            </div>

            {/* Color indicator */}
            <div className="mt-5 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: category.color || "#6366f1",
                }}
              />

              <span className="text-xs text-white/30">Active category</span>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d0f] shadow-2xl">
            {/* Header */}
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white">
                    {editingCategory ? "Edit category" : "Create category"}
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Organize your spending your way.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.05] hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              {/* Category name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Category name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Food & Dining"
                  maxLength={50}
                  autoFocus
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">
                  Choose an icon
                </label>

                <div className="grid grid-cols-6 gap-2">
                  {categoryIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          icon,
                        })
                      }
                      className={`flex h-11 items-center justify-center rounded-xl border text-xl transition ${
                        form.icon === icon
                          ? "border-white/30 bg-white/10"
                          : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">
                  Choose a color
                </label>

                <div className="flex flex-wrap gap-3">
                  {categoryColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          color,
                        })
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        form.color === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#0d0d0f]"
                          : ""
                      }`}
                      style={{
                        backgroundColor: color,
                      }}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">
                  Preview
                </p>

                <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
                    style={{
                      backgroundColor: `${form.color}20`,
                      color: form.color,
                    }}
                  >
                    {form.icon}
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      {form.name || "Category name"}
                    </p>

                    <p className="mt-0.5 text-xs text-white/35">
                      Expense category
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving
                    ? editingCategory
                      ? "Saving..."
                      : "Creating..."
                    : editingCategory
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#0d0d0f] p-6 shadow-2xl">
            {!deleteError ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                  ⚠️
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  Delete category?
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  You're about to delete{" "}
                  <span className="font-medium text-white">
                    {deletingCategory.name}
                  </span>
                  . This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(null)}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await deleteCategory(deletingCategory.id);

                        setCategories((current) =>
                          current.filter(
                            (item) => item.id !== deletingCategory.id,
                          ),
                        );

                        setDeletingCategory(null);
                      } catch (error: any) {
                        if (error?.response?.status === 409) {
                          setDeleteError(
                            "This category is being used by one or more expenses. Move those expenses to another category before deleting it.",
                          );
                        } else {
                          setDeleteError("Unable to delete this category.");
                        }
                      }
                    }}
                    className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
                  >
                    Delete category
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
                  🔒
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">
                  Category can't be deleted
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {deleteError}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setDeletingCategory(null);
                    setDeleteError(null);
                  }}
                  className="mt-6 w-full rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
