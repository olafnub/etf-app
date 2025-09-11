export default function PrivacyPage() {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[var(--color-muted)]">Last updated: September 10, 2025</p>
  
        <section className="mt-8 space-y-6 text-base leading-relaxed">
          <p>
            Your privacy matters to us. This Privacy Policy explains what data we collect and how it is used.
          </p>
  
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p>
            The only personal data we collect directly is your email address, if you subscribe for
            launch updates or notifications.
          </p>
  
          <h2 className="text-xl font-semibold">Blockchain Transparency</h2>
          <p>
            Opi Trade interacts with public blockchains. Transaction data (such as wallet addresses,
            amounts, and activity) is public and visible to anyone. We do not control this transparency,
            nor can we remove or alter blockchain records.
          </p>
  
          <h2 className="text-xl font-semibold">Third-Party Services</h2>
          <p>
            This website is hosted on Vercel and built with Next.js. These services may collect technical
            data such as IP addresses, device/browser type, and usage analytics. Please refer to their
            privacy policies for details.
          </p>
  
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <p>
            We use your email address only to send product updates and announcements. We do not sell,
            rent, or trade your personal data.
          </p>
  
          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p>
            You may unsubscribe at any time or request deletion of your data by contacting us.
          </p>
  
          <h2 className="text-xl font-semibold">Changes to this Policy</h2>
          <p>
            We may revise this Privacy Policy from time to time. Updates will be posted here with a new
            effective date.
          </p>
        </section>
      </main>
    )
  }
  