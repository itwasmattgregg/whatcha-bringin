import Head from 'next/head';
import Link from 'next/link';
import {
  SITE_NAME,
  buildCanonicalUrl,
  getAbsoluteSocialImage,
} from '../lib/seo';

const LAST_UPDATED = 'November 14, 2025';

export default function PrivacyPolicy() {
  const canonicalUrl = buildCanonicalUrl('/privacy');
  const socialImage = getAbsoluteSocialImage();
  const policyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'PrivacyPolicy',
    name: `${SITE_NAME} Privacy Policy`,
    url: canonicalUrl,
    dateModified: LAST_UPDATED,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: buildCanonicalUrl('/'),
    },
  };

  return (
    <>
      <Head>
        <title>Privacy Policy — {SITE_NAME}</title>
        <meta
          name="description"
          content="Learn how Watcha Bringin collects, uses, and protects your information when you plan potluck gatherings with friends."
        />
        <meta property="og:title" content={`Privacy Policy — ${SITE_NAME}`} />
        <meta
          property="og:description"
          content="Transparency on the data we collect, how we use it, and the controls you have when using Watcha Bringin."
        />
        <meta property="og:image" content={socialImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`Privacy Policy — ${SITE_NAME}`} />
        <meta
          name="twitter:description"
          content="Transparency on the data we collect, how we use it, and the controls you have when using Watcha Bringin."
        />
        <meta name="twitter:image" content={socialImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(policyJsonLd) }}
        />
      </Head>
      <main className="bg-gradient-to-b from-green-50 to-white min-h-screen py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur rounded-3xl shadow-lg border border-green-100 px-6 sm:px-10 py-10 space-y-10">
          <header className="space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-green-600">
              Privacy Policy
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Your Privacy, On Purpose
            </h1>
            <p className="text-gray-500">Last updated {LAST_UPDATED}</p>
          </header>

          <section className="space-y-4 text-lg leading-relaxed text-gray-700">
            <p>
              This Privacy Policy explains how {SITE_NAME} (&quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) collects, uses, and safeguards
              information when you visit <Link href="/">our website</Link>,
              download the mobile app, or interact with any of our services
              (collectively, the &quot;Services&quot;). By using the Services,
              you agree to the practices described below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>Account details:</strong> Phone numbers, display names,
                and verification codes required to authenticate you via SMS or
                magic link.
              </li>
              <li>
                <strong>Gathering content:</strong> Event names, descriptions,
                dates, locations, images uploaded to Cloudinary, invited guest
                phone numbers, item assignments, and RSVPs that you add to the
                app.
              </li>
              <li>
                <strong>Communications:</strong> Messages you send through our
                support form and limited SMS metadata processed by Twilio (such
                as the delivery status of invite texts).
              </li>
              <li>
                <strong>Device &amp; usage data:</strong> App version,
                operating system, log data, and aggregated analytics collected
                via Vercel Analytics or similar tools to keep the Services
                running reliably.
              </li>
              <li>
                <strong>Payment/support information:</strong> If you donate via
                services like Buy Me a Coffee, those platforms process your
                payment details under their own terms and share with us only the
                info needed to confirm your support.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              How We Use Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Authenticate you and secure your account.</li>
              <li>
                Create gatherings, send invitations, and coordinate contributions
                at your direction.
              </li>
              <li>
                Operate, maintain, and improve the Services, including debugging
                and analytics.
              </li>
              <li>
                Communicate with you about updates, support requests, and policy
                changes.
              </li>
              <li>
                Protect against fraud, abuse, and violations of our Terms of
                Service.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              When We Share Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell your personal information. We share data only with
              trusted service providers that enable core functionality:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>
                <strong>Twilio</strong> for delivering SMS authentication codes
                and invites.
              </li>
              <li>
                <strong>Cloudinary</strong> for securely storing gathering
                images you upload.
              </li>
              <li>
                <strong>Vercel</strong> and similar hosting or analytics
                partners to run the website and API.
              </li>
              <li>
                <strong>App stores &amp; donation platforms</strong> (Apple,
                Google, Buy Me a Coffee) when you interact with their services.
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Each provider only receives the information necessary to deliver
              their service, and they are bound by contractual and legal privacy
              obligations. We may also disclose information if required by law
              or to protect our users, rights, or property.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your account information and gatherings for as long as
              you maintain an active profile so that you can revisit past events
              or reuse them. If you delete a gathering or request deletion of
              your account, we remove or anonymize related data within
              reasonable timeframes, except where we must keep it to comply with
              legal obligations or resolve disputes. Backups are purged on a
              rolling basis.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Rights &amp; Choices
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>View or update your gathering details directly in the app.</li>
              <li>
                Delete gatherings, remove items, or revoke invitations you have
                sent.
              </li>
              <li>
                Request a copy of your data or ask us to delete your account by
                contacting support. We will verify your identity before acting
                on these requests.
              </li>
              <li>
                Opt out of non-essential communications by following unsubscribe
                links or replying STOP to SMS where applicable.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We use industry-standard safeguards such as encrypted connections,
              access controls, and continual monitoring to protect your
              information. No system is perfectly secure, so please contact us
              immediately if you suspect unauthorized activity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {SITE_NAME} is intended for people who are 13 or older. We do not
              knowingly collect personal information from children. If you
              believe a child provided information to us, please contact us so
              we can delete it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Changes</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy to reflect product changes,
              legal requirements, or best practices. When we do, we will revise
              the &quot;Last updated&quot; date and post the revised policy on
              this page. Significant updates may also be communicated in-app.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              Have questions or want to make a privacy request? Visit our{' '}
              <a href="https://whatcha-bringin.app/support" className="text-green-600 underline">
                support page
              </a>{' '}
              and we&apos;ll get back to you as soon as we can.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}


