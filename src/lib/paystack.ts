const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export async function paystackInitialize(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo, // Paystack expects the smallest currency unit
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed: ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    data: { authorization_url: string; access_code: string; reference: string };
  }>;
}

export async function paystackVerify(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed: ${body}`);
  }

  return res.json() as Promise<{
    status: boolean;
    data: { status: "success" | "failed" | "abandoned"; reference: string; amount: number };
  }>;
}
