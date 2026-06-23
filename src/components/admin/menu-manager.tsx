"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/utils";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  available: boolean;
};

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "" });

  function load() {
    setLoading(true);
    fetch("/api/admin/menu")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        priceKobo: Math.round(parseFloat(form.price) * 100),
      }),
    });
    setForm({ name: "", description: "", price: "" });
    setSaving(false);
    load();
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
    if (!confirm("Remove this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-indigo-deep">Add menu item</h2>
        <p className="mt-1 text-sm text-charcoal/55">
          New items appear on the public menu when marked available.
        </p>
        <form
          onSubmit={addItem}
          className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
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
          <Button type="submit" disabled={saving}>
            {saving ? "Adding…" : "Add item"}
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-charcoal/10 bg-white shadow-sm">
        <div className="border-b border-charcoal/10 px-6 py-4">
          <h2 className="font-serif text-xl text-indigo-deep">All items</h2>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-sm text-charcoal/50">Loading menu…</p>
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
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-serif text-lg text-indigo-deep">
                      {item.name}
                    </p>
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
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(item.id)}
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
