import type { PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { brand } from '../domain/brand'
import { useDocumentMeta } from '../lib/seo'

// Public information describing the data used for schedules, accounts and alerts.

const CONTACT_EMAIL = 'privacy@silbosports.com'
const LAST_UPDATED = 'October 9, 2026'

function LegalLayout({ title, intro, children }: PropsWithChildren<{ title: string; intro: ReactNode }>) {
  return (
    <article className="editorial-surface mx-auto max-w-3xl">
      <header className="mb-8 border-b border-primary/15 pb-6">
        <p className="board-label mb-2 text-xs uppercase tracking-[0.2em] text-primary/70">{brand.appName}</p>
        <h1 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink/60">{intro}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">
          Last updated {LAST_UPDATED}
        </p>
      </header>
      <div className="space-y-7 text-sm leading-relaxed text-ink/80 [&_a]:text-primary [&_a]:underline [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:tracking-wide [&_h2]:text-ink [&_li]:ml-1 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <footer className="mt-10 border-t border-primary/15 pt-6 text-sm text-ink/55">
        Questions? Email <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.{' '}
        See also our{' '}
        <Link className="text-primary underline" to="/terms">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link className="text-primary underline" to="/privacy">
          Privacy Policy
        </Link>
        .
      </footer>
    </article>
  )
}

function Section({ id, heading, children }: PropsWithChildren<{ id: string; heading: string }>) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id}>{heading}</h2>
      {children}
    </section>
  )
}

export function PrivacyPage() {
  useDocumentMeta({
    title: 'Privacy Policy - Silbo Sports',
    description:
      'How Silbo Sports handles account details, schedules, alerts, essential storage and your privacy choices.',
    canonicalPath: '/privacy',
  })

  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`How ${brand.appName} handles the small amount of data it needs to build your schedule, sync it across devices, and (optionally) send you alerts.`}
    >
      <Section id="summary" heading="The short version">
        <ul>
          <li>You can use {brand.appName} without an account. Your picks live in your browser.</li>
          <li>If you sign in, we store your email, your follows, and your display preferences so your schedule follows you across devices.</li>
          <li>We don&apos;t sell your data or load advertising trackers.</li>
          <li>You can export everything and delete your account at any time from your{' '}
            <Link to="/account">account page</Link>.</li>
        </ul>
      </Section>

      <Section id="what-we-collect" heading="What we collect">
        <ul>
          <li>
            <strong>Account</strong> — your email address, used to sign you in with a magic link, and to send any
            alerts you opt into. We never see or store a password.
          </li>
          <li>
            <strong>Your schedule</strong> — the teams, leagues, players, drivers, fighters, and custom leagues you follow,
            plus display preferences (timezone, city, language, clock format, theme). Without an account these stay in your
            browser&apos;s local storage; once you sign in they sync to your account.
          </li>
          <li>
            <strong>Calendar feeds &amp; alerts</strong> — if you create a subscribed calendar feed or enable email/push
            reminders, we store the feed configuration, your alert preferences, and (for push) your browser&apos;s push
            subscription.
          </li>
          <li>
            <strong>Community images</strong> — league, team and player images are resized to small thumbnails in your browser. Photo metadata and original files are not uploaded. Thumbnails are saved with league data locally and, when signed in, in Supabase. They can appear on a public share page when you enable sharing. Upload only images you have permission to use and share.
          </li>
          <li>
            <strong>Basic technical data</strong> — standard server logs (IP address, browser type, timestamps) kept by our
            hosting providers for security and abuse prevention.
          </li>
        </ul>
        <p>
          We do not knowingly collect data from children under 13 (or under 16 in the EU/UK). {brand.appName} is a general
          schedule tool, not directed at children.
        </p>
      </Section>

      <Section id="cookies" heading="Cookies &amp; local storage">
        <ul>
          <li>
            <strong>Essential storage</strong> — we use your browser&apos;s local storage to remember your picks, preferences,
            and sign-in session. This is required for the app to work and is never used for tracking.
          </li>
        </ul>
        <p>
          You can remove locally saved picks and preferences by clearing site data. Silbo does not use advertising cookies.
        </p>
      </Section>

      <Section id="sharing" heading="Who we share data with">
        <p>We use a small set of processors to run the service. We don&apos;t sell personal data to anyone.</p>
        <ul>
          <li><strong>Supabase</strong> — authentication and database (your account, follows, preferences).</li>
          <li><strong>Cloudflare</strong> — hosting and content delivery.</li>
          <li><strong>Email delivery</strong> — sign-in emails use Supabase authentication. Email and push event alerts are currently paused; Resend is a configured option for future alert delivery.</li>
          <li><strong>Broadcasters</strong> — direct links open the broadcaster&apos;s own website, which has its own privacy policy. Silbo adds no affiliate tracking.</li>
        </ul>
      </Section>

      <Section id="rights" heading="Your rights &amp; choices">
        <ul>
          <li><strong>Access &amp; export</strong> — your schedule is always exportable as .ics, image, or text from the Exports page.</li>
          <li><strong>Deletion</strong> — delete your account and all associated data from your{' '}
            <Link to="/account">account page</Link>. Local-only data is removed by clearing your browser storage.</li>
          <li><strong>Alerts</strong> — turn email or push reminders off any time from{' '}
            <Link to="/settings/alerts">Alert settings</Link>.</li>
          <li>If you&apos;re in the EU/UK/California, you have rights to access, correct, delete, and object to processing of
            your data. Email us to exercise them.</li>
        </ul>
      </Section>

      <Section id="retention" heading="How long we keep data">
        <p>
          We keep account data for as long as your account exists. When you delete your account, your profile, follows,
          calendar feeds, alert preferences, and push subscriptions are deleted. Internal hydration run logs are retained
          for 30 days and dispatch logs for 14 days. Our current Supabase Free project has no automatic database backup service;
          we do not promise a backup deletion period that has not been established.
        </p>
      </Section>

      <Section id="changes" heading="Changes to this policy">
        <p>
          We&apos;ll update the date at the top when this policy changes. Material changes will be highlighted in the app.
        </p>
      </Section>
    </LegalLayout>
  )
}

export function TermsPage() {
  useDocumentMeta({
    title: 'Terms of Service - Silbo Sports',
    description:
      'The terms for using Silbo Sports schedules, calendar exports, reminders, community leagues, and third-party links.',
    canonicalPath: '/terms',
  })

  return (
    <LegalLayout
      title="Terms of Service"
      intro={`The basics of using ${brand.appName}. By using the service you agree to these terms.`}
    >
      <Section id="service" heading="The service">
        <p>
          {brand.appName} aggregates publicly available sports schedules into one local-time view you can save, share, sync,
          and get reminders for. It also lets you build and share your own custom league schedules.
        </p>
      </Section>

      <Section id="accuracy" heading="Schedules are best-effort">
        <p>
          Event times, venues, and broadcast details come from third-party sources and change without notice. We work to keep
          them accurate but make no guarantee. <strong>Always confirm against official sources before travelling or making
          plans.</strong> {brand.appName} is not liable for missed events or losses arising from schedule changes.
        </p>
      </Section>

      <Section id="accounts" heading="Your account">
        <ul>
          <li>You&apos;re responsible for activity under your account and for keeping access to your email secure.</li>
          <li>Don&apos;t use the service to break the law, infringe others&apos; rights, scrape at scale, or disrupt the service.</li>
          <li>We may suspend accounts that abuse the service or its providers.</li>
        </ul>
      </Section>

      <Section id="custom" heading="Custom leagues &amp; shared schedules">
        <p>
          You own the custom league content you create. By enabling a public share link you make that schedule viewable by
          anyone with the link. You&apos;re responsible for the content you publish and for having the right to share it.
        </p>
      </Section>

      <Section id="experience" heading="An experience for fans">
        <p>
          {brand.appName} provides schedules and calendar tools without ads or affiliate promotions.
          Broadcaster links are provided to help you find coverage in your region. Their availability,
          subscription requirements and terms are controlled by the broadcaster.
        </p>
      </Section>

      <Section id="ip" heading="Intellectual property">
        <p>
          {brand.appName}&apos;s name, branding, and original content are ours. Team names, league marks, and event data belong
          to their respective owners and are used for identification only.
        </p>
      </Section>

      <Section id="warranty" heading="No warranty &amp; limitation of liability">
        <p>
          The service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law,
          {' '}{brand.appName} is not liable for any indirect, incidental, or consequential damages arising from your use of
          the service.
        </p>
      </Section>

      <Section id="changes" heading="Changes &amp; termination">
        <p>
          We may update these terms or the service over time. Continued use after changes means you accept them. You can stop
          using the service and delete your account at any time.
        </p>
      </Section>
    </LegalLayout>
  )
}
