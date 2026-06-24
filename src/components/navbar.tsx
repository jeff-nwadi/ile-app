"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();
  const { data: session, refetch: refetchSession } = useSession();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    // Force other useSession() subscribers to drop the cached session so
    // the UI flips from "Dashboard / Sign Out" back to "Log In" immediately,
    // without waiting for a router refresh.
    await refetchSession?.();
    router.push("/");
    router.refresh();
  }

  function close() {
    setOpen(false);
  }

  // Lock body scroll when the drawer is open. Close on Escape or outside tap.
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (
        mobileMenuRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <>
      <header id="landing-nav" className="landing-nav">
        <Link href="/" className="nav-mark" onClick={close}>
          Ilé
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link href="/#philosophy">Philosophy</Link>
          <Link href="/menu">Tasting Menu</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/reserve">Reserve</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button type="button" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/sign-in">Log In</Link>
          )}
        </div>

        {/* Mobile hamburger — kept inside the nav so the Menu icon stays
            legible over any hero background via mix-blend-mode: difference. */}
        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className={`nav-mobile-trigger${open ? " open" : ""}`}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </header>

      {/* Mobile drawer — rendered as a sibling of the nav (NOT a descendant)
          so the nav's mix-blend-mode: difference can't leak into the drawer
          contents. Fixed positioning means DOM order doesn't affect layout. */}
      <div
        ref={mobileMenuRef}
        id="nav-mobile-menu"
        className={`nav-mobile-menu${open ? " open" : ""}`}
        aria-hidden={!open}
      >
        <div className="nav-mobile-links">
          <Link href="/#philosophy" onClick={close} style={{ animationDelay: "0ms" }}>
            Philosophy
          </Link>
          <Link href="/menu" onClick={close} style={{ animationDelay: "60ms" }}>
            Tasting Menu
          </Link>
          <Link href="/gallery" onClick={close} style={{ animationDelay: "120ms" }}>
            Gallery
          </Link>
          <Link href="/reserve" onClick={close} style={{ animationDelay: "180ms" }}>
            Reserve
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={close} style={{ animationDelay: "240ms" }}>
                Dashboard
              </Link>
              <button type="button" onClick={handleSignOut} style={{ animationDelay: "300ms" }}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/sign-in" onClick={close} style={{ animationDelay: "240ms" }}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}