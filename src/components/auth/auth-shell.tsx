import Link from "next/link";

type AuthShellProps = {
  variant: "client" | "admin";
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const copy = {
  client: {
    tag: "Guest access",
    headline: "Book a table. Order ahead. Return often.",
  },
  admin: {
    tag: "Staff access",
    headline: "The back of house, as quiet as the dining room.",
  },
};

export function AuthShell({ variant, children, footer }: AuthShellProps) {
  const { tag, headline } = copy[variant];

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-indigo-deep lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-deep via-indigo-deep/80 to-indigo-deep/40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-ivory">
          <Link href="/" className="font-serif text-3xl font-semibold">
            Ilé
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              {tag}
            </p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight">
              {headline}
            </h2>
          </div>
          <p className="text-sm text-ivory/50">Victoria Island, Lagos</p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-16 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-block font-serif text-2xl text-indigo-deep lg:hidden"
          >
            Ilé
          </Link>
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
