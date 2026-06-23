"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";

export function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav id="landing-nav" className="landing-nav">
      <Link href="/" className="nav-mark">
        Ilé
      </Link>
      <div className="nav-links">
        <Link href="/#philosophy">Philosophy</Link>
        <Link href="/menu">Tasting Menu</Link>
        <Link href="/gallery">Gallery</Link>
        <Link href="/reserve">Reserve</Link>
        {session?.user ? (
          <button type="button" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <Link href="/sign-in">Log In</Link>
        )}
      </div>
    </nav>
  );
}
