import { Resend } from "resend";
import SubscribeForm from "@/components/SubscribeForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,rgba(0,0,0,0)_55%)]">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-sm font-medium tracking-tight opacity-80">opi.trade</div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">Learn More</a>
            <a
              href="#"
              className="rounded-full bg-[var(--color-primary)] px-4 py-2 font-medium text-black transition-colors hover:bg-[var(--color-primary-300)]"
            >
              Join the Community
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-28 text-center md:pt-36">
        <h1 className="font-opi text-5xl italic leading-tight md:text-7xl">
          Built on <span className="text-[#0052FF]">Base</span>
        </h1>
        <p className="font-opi mt-5 max-w-2xl text-balance text-base text-[var(--color-muted)] md:text-lg">
          Outperforming Bitcoin with crypto index funds
          {/* trade Crypto Index funds on your 📱 */}
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-xl px-4 text-center">
        {/* <h2 className="text-2xl font-semibold">Stay Updated</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Get the latest news and updates straight to your inbox.
        </p> */}
        <SubscribeForm action={subscribeAction} />
      </section>

      {/* Footer */}
      <footer className="mx-auto mt-24 w-full max-w-6xl px-4 pb-8">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[var(--color-muted)] md:flex-row">
          <div>Opi Trade</div>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:opacity-100 opacity-80">Terms</a>
            <a href="/privacy" className="hover:opacity-100 opacity-80">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

// Server Action: sends email to your inbox via Resend
async function subscribe(formData: FormData) {
  "use server";
  return { ok: true };

  // const email = String(formData.get("email") || "").trim();
  // if (!email) return { ok: false };

  // const resendApiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;
  // const toEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ""; // set your inbox
  // if (!resendApiKey || !toEmail) {
  //   console.warn("Missing RESEND_API_KEY or CONTACT_EMAIL env var");
  //   return { ok: false };
  // }

  // const resend = new Resend(resendApiKey);
  // try {
  //   await resend.emails.send({
  //     from: "opi.trade <noreply@updates.opi.trade>",
  //     to: toEmail,
  //     subject: "New waitlist signup",
  //     text: `New subscriber: ${email}`,
  //   });
  //   return { ok: true };
  // } catch (error) {
  //   console.error("Resend error", error);
  //   return { ok: false };
  // }
}

// Server reducer compatible with useFormState
async function subscribeAction(_prev: { ok: boolean }, formData: FormData) {
  "use server";
  return subscribe(formData);
}
