"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/animate-ui/components/radix/alert-dialog";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  available: boolean;
  categoryId: string | null;
  imageUrl: string | null;
};

type Category = {
  id: string;
  name: string;
};

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/menu").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([admin, cats]) => {
        setItems(admin.items ?? []);
        setCategories(cats.categories ?? []);
      })
      .catch((err) => console.error("Load error:", err))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm({ ...form, imageUrl: data.url });
    } catch (error) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      // Update existing item
      await fetch(`/api/menu/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          priceKobo: Math.round(parseFloat(form.price) * 100),
          categoryId: form.categoryId || null,
          imageUrl: form.imageUrl || null,
        }),
      });
      setEditingId(null);
    } else {
      // Create new item
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          priceKobo: Math.round(parseFloat(form.price) * 100),
          categoryId: form.categoryId || null,
          imageUrl: form.imageUrl || null,
        }),
      });
    }

    setForm({ name: "", description: "", price: "", categoryId: "", imageUrl: "" });
    setSaving(false);
    load();
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: (item.priceKobo / 100).toString(),
      categoryId: item.categoryId || "",
      imageUrl: item.imageUrl || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", categoryId: "", imageUrl: "" });
  }

  async function toggleAvailable(item: MenuItem) {
    await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-indigo-deep">
          {editingId ? "Edit menu item" : "Add menu item"}
        </h2>
        <p className="mt-1 text-sm text-charcoal/55">
          {editingId
            ? "Update the item details below."
            : "New items appear on the public menu when marked available."}
        </p>
        <form
          onSubmit={addItem}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-desc">Description</Label>
              <Input
                id="item-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₦)</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <select
                id="item-category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-charcoal/20 bg-white px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-image">Image</Label>
              <Input
                id="item-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
          </div>
          
          {form.imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-charcoal/55 mb-2">Image preview:</p>
              <img
                src={form.imageUrl}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border border-charcoal/10"
              />
            </div>
          )}

          <Button type="submit" disabled={saving || uploading}>
            {saving ? (editingId ? "Saving…" : "Adding…") : (editingId ? "Save changes" : "Add item")}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <div className="border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-serif text-xl text-indigo-deep">All items</h2>
        </div>

        {loading ? (
          <div className="divide-y divide-charcoal/10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex shrink-0 gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-sm text-charcoal/50">
            No menu items yet. Add your first dish above.
          </p>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-24 w-24 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-serif text-lg text-indigo-deep">
                      {item.name}
                    </p>
                    {item.categoryId && (
                      <span className="rounded-full bg-indigo-deep/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-indigo-deep">
                        {categories.find((c) => c.id === item.categoryId)
                          ?.name || "Unknown"}
                      </span>
                    )}
                    {!item.available && (
                      <span className="rounded-full bg-charcoal/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-charcoal/60">
                        Hidden
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-charcoal/55">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-sm text-gold">
                    {formatNaira(item.priceKobo)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(item)}
                  >
                    <Edit className="size-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAvailable(item)}
                  >
                    {item.available ? (
                      <>
                        <EyeOff className="size-3.5" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" /> Show
                      </>
                    )}
                  </Button>
                  <AlertDialog open={deletingId === item.id} onOpenChange={(open) => {
                    if (!open) setDeletingId(null);
                  }}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete menu item?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <p className="text-sm opacity-70">
                        Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
                      </p>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => remove(item.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeletingId(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
