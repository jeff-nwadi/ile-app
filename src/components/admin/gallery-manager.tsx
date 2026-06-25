"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/animate-ui/components/radix/alert-dialog";

type GalleryItem = {
  id: string;
  caption: string;
  imageUrl: string;
  speed: string;
  sortOrder: number;
};

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    caption: "",
    imageUrl: "",
    speed: "0.15",
    sortOrder: "0",
  });

  function load() {
    setLoading(true);
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
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
      await fetch(`/api/admin/gallery/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: form.caption,
          imageUrl: form.imageUrl,
          speed: form.speed,
          sortOrder: parseInt(form.sortOrder),
        }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: form.caption,
          imageUrl: form.imageUrl,
          speed: form.speed,
          sortOrder: parseInt(form.sortOrder),
        }),
      });
    }

    setForm({ caption: "", imageUrl: "", speed: "0.15", sortOrder: "0" });
    setSaving(false);
    load();
  }

  function startEdit(item: GalleryItem) {
    setEditingId(item.id);
    setForm({
      caption: item.caption,
      imageUrl: item.imageUrl,
      speed: item.speed,
      sortOrder: item.sortOrder.toString(),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ caption: "", imageUrl: "", speed: "0.15", sortOrder: "0" });
  }

  async function remove(id: string) {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-indigo-deep">
          {editingId ? "Edit gallery item" : "Add gallery item"}
        </h2>
        <p className="mt-1 text-sm text-charcoal/55">
          {editingId
            ? "Update the gallery item."
            : "Add images to the gallery."}
        </p>

        <form onSubmit={addItem} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                required
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed (parallax)</Label>
              <Input
                id="speed"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={form.speed}
                onChange={(e) => setForm({ ...form, speed: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
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
            {saving
              ? editingId
                ? "Saving…"
                : "Adding…"
              : uploading
                ? "Uploading…"
                : editingId
                  ? "Save changes"
                  : "Add item"}
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
          <h2 className="font-serif text-xl text-indigo-deep">Gallery items</h2>
        </div>

        {loading ? (
          <div className="divide-y divide-charcoal/10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex shrink-0 gap-2">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-sm text-charcoal/50">
            No gallery items yet.
          </p>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  className="h-24 w-24 object-cover rounded-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg text-indigo-deep">
                    {item.caption}
                  </p>
                  <p className="text-sm text-charcoal/55">
                    Speed: {item.speed}
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
                  <AlertDialog
                    open={deletingId === item.id}
                    onOpenChange={(open) => {
                      if (!open) setDeletingId(null);
                    }}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete gallery item?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <p className="text-sm opacity-70">
                        Are you sure you want to delete{" "}
                        <strong>{item.caption}</strong>?
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
