import { db } from "@/db";
import { order } from "@/db/schema";
import { paystackVerify } from "@/lib/paystack";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  let status: "success" | "failed" | "missing" = "missing";

  if (ref) {
    try {
      const result = await paystackVerify(ref);
      if (result.data.status === "success") {
        status = "success";
        await db
          .update(order)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(order.paystackReference, ref));
      } else {
        status = "failed";
      }
    } catch {
      status = "failed";
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-40 px-[6vw] pb-32 max-w-xl mx-auto text-center">
        {status === "success" && (
          <>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">
              Payment confirmed
            </span>
            <h1 className="font-serif text-4xl mt-4 mb-5">Thank you.</h1>
            <p className="opacity-70">
              Your order is in. Our kitchen has been notified — we&apos;ll
              reach out by phone if anything needs confirming.
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <h1 className="font-serif text-4xl mb-5">Payment didn&apos;t go through.</h1>
            <p className="opacity-70">
              No charge was completed. Please try again, or contact us if
              you&apos;re unsure.
            </p>
          </>
        )}
        {status === "missing" && (
          <h1 className="font-serif text-4xl mb-5">No payment reference found.</h1>
        )}
        <Button asChild className="mt-10">
          <Link href="/menu">Back to menu</Link>
        </Button>
      </main>
    </>
  );
}
