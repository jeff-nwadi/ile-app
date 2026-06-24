"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/utils";

type MenuItem = {
  id: string;
  categoryId: string | null;
  name: string;
  description: string;
  priceKobo: number;
  imageUrl: string | null;
  available: boolean;
};
type Category = { id: string; name: string; sortOrder: number };

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    setLoading(true);
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data) => {
        console.log("Menu data:", data);
        setItems(data.items);
        setCategories(data.categories);
      })
      .catch((err) => console.error("Menu fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ item: items.find((i) => i.id === id)!, qty }))
        .filter((c) => c.item),
    [cart, items],
  );

  const total = cartItems.reduce((sum, c) => sum + c.item.priceKobo * c.qty, 0);

  function addToCart(id: string, delta: number) {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes,
          items: cartItems.map((c) => ({
            menuItemId: c.item.id,
            quantity: c.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      // Redirect to Paystack's hosted checkout page
      window.location.href = data.checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 px-[6vw] pb-32 max-w-5xl mx-auto">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
          Order Online
        </span>
        <h1
          className="font-serif mt-3 mb-12"
          style={{ fontSize: "clamp(34px,5vw,56px)" }}
        >
          Tonight&apos;s Menu
        </h1>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-5"
                    >
                      <Skeleton className="h-32 w-32 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 w-full">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-10 w-10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 && items.length === 0 ? (
          <p className="opacity-60 text-sm">
            No menu items yet — add some from the admin dashboard.
          </p>
        ) : (
          <>
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.categoryId === cat.id);
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} className="mb-14">
                  <h2 className="font-serif text-2xl mb-5">{cat.name}</h2>
                  <div className="divide-y divide-charcoal/10 border-t border-charcoal/10">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-5"
                      >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-32 w-32 object-cover rounded-lg shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-serif text-xl">{item.name}</p>
                      <p className="text-sm opacity-60 mt-1 max-w-md">
                        {item.description}
                      </p>
                      <p className="font-mono text-sm text-indigo mt-1">
                        {formatNaira(item.priceKobo)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => addToCart(item.id, -1)}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center font-mono">
                        {cart[item.id] ?? 0}
                      </span>
                      <Button size="icon" onClick={() => addToCart(item.id, 1)}>
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
          </>
        )}
      </main>

      {/* Sticky cart bar */}
      {cartItems.length > 0 && !showCheckout && (
        <div className="fixed bottom-0 left-0 right-0 bg-charcoal text-ivory px-[6vw] py-5 flex items-center justify-between z-40">
          <span className="font-mono text-sm">
            {cartItems.reduce((n, c) => n + c.qty, 0)} items —{" "}
            {formatNaira(total)}
          </span>
          <Button variant="gold" onClick={() => setShowCheckout(true)}>
            Checkout
          </Button>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-charcoal/70 z-50 flex items-center justify-center p-6">
          <form
            onSubmit={checkout}
            className="bg-ivory rounded-lg max-w-md w-full p-8 space-y-5"
          >
            <h3 className="font-serif text-2xl">Your details</h3>
            <p className="font-mono text-xs opacity-60">
              Total: {formatNaira(total)}
            </p>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCheckout(false)}
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Redirecting…" : "Pay with Paystack"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
