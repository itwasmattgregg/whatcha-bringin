import { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  META_DESCRIPTION,
  SITE_NAME,
  buildCanonicalUrl,
  getAbsoluteSocialImage,
} from '../lib/seo';

const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/29s6gtvjb';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

type FeedbackType = 'praise' | 'bug' | 'feature-request' | 'other';

export default function SupportPage() {
  const canonicalUrl = buildCanonicalUrl('/support');
  const socialImage = getAbsoluteSocialImage();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || typeof window === 'undefined') {
      return;
    }

    if (window.grecaptcha) {
      setIsRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsRecaptchaLoaded(true);
    script.onerror = () => {
      console.warn('Failed to load reCAPTCHA script');
      setIsRecaptchaLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const executeRecaptcha = async () => {
    if (
      !RECAPTCHA_SITE_KEY ||
      !isRecaptchaLoaded ||
      typeof window === 'undefined' ||
      !window.grecaptcha
    ) {
      return 'dev-token';
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: 'submit',
      });
      return token;
    } catch (error) {
      console.warn(
        'reCAPTCHA execution failed, falling back to dev-token',
        error
      );
      return 'dev-token';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage('Please enter a message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha();
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          type,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Failed to submit feedback. Please try again.'
        );
      }

      setSuccessMessage('Thanks for reaching out!');
      setEmail('');
      setMessage('');
      setType('other');
    } catch (error) {
      console.error('Support form submission failed:', error);
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again or email support.';
      setErrorMessage(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Support — {SITE_NAME}</title>
        <meta
          name='description'
          content='Get support for Watcha Bringin, report bugs, or share feature ideas directly with the developer.'
        />
        <meta property='og:title' content={`Support — ${SITE_NAME}`} />
        <meta property='og:description' content={META_DESCRIPTION} />
        <meta property='og:image' content={socialImage} />
        <meta property='og:url' content={canonicalUrl} />
        <meta name='twitter:title' content={`Support — ${SITE_NAME}`} />
        <meta name='twitter:description' content={META_DESCRIPTION} />
        <meta name='twitter:image' content={socialImage} />
        <link rel='canonical' href={canonicalUrl} />
      </Head>
      <main className='min-h-screen bg-linear-to-b from-green-50 via-white to-white py-16 px-4'>
        <div className='max-w-5xl mx-auto grid gap-12 lg:grid-cols-2'>
          <section className='bg-white/90 backdrop-blur border border-green-100 rounded-3xl shadow-lg p-8 space-y-6'>
            <p className='text-sm uppercase tracking-[0.3em] text-green-600'>
              Support
            </p>
            <h1 className='text-4xl font-extrabold text-gray-900'>
              How can I help?
            </h1>
            <p className='text-lg text-gray-600 leading-relaxed'>
              Watcha Bringin is a one-human project. Whether you found a bug,
              have an idea, or just want to say thanks, this form is the fastest
              way to reach me. Your message goes straight into the same support
              system used inside the app, so nothing gets lost.
            </p>

            <form className='space-y-6' onSubmit={handleSubmit}>
              <div className='flex flex-wrap gap-3'>
                {[
                  { value: 'praise', label: '👍 Praise' },
                  { value: 'bug', label: '🐛 Bug' },
                  { value: 'feature-request', label: '💡 Feature' },
                  { value: 'other', label: '✨ Other' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => setType(option.value as FeedbackType)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                      type === option.value
                        ? 'bg-green-600 border-green-600 text-white shadow'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-800'>
                  Your Email *
                </label>
                <input
                  type='email'
                  className='w-full rounded-2xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='you@example.com'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-semibold text-gray-800'>
                  Your Message *
                </label>
                <textarea
                  className='w-full rounded-2xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[160px]'
                  placeholder="Tell me what's on your mind..."
                  maxLength={2000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
                <p className='text-xs text-gray-500 text-right'>
                  {message.length}/2000
                </p>
              </div>

              {errorMessage && (
                <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className='rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
                  {successMessage}
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className={`w-full rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
              <p className='text-xs text-gray-500 text-center'>
                Protected by reCAPTCHA.{' '}
                <a
                  href='https://policies.google.com/privacy'
                  className='underline'
                  target='_blank'
                  rel='noreferrer'
                >
                  Privacy
                </a>{' '}
                ·{' '}
                <a
                  href='https://policies.google.com/terms'
                  className='underline'
                  target='_blank'
                  rel='noreferrer'
                >
                  Terms
                </a>
              </p>
            </form>
          </section>

          <aside className='bg-white/80 backdrop-blur border border-green-100 rounded-3xl shadow-lg p-8 flex flex-col space-y-6'>
            <div className='text-6xl'>☕</div>
            <h2 className='text-3xl font-bold text-gray-900'>
              Want to go the extra mile?
            </h2>
            <p className='text-lg text-gray-600 leading-relaxed'>
              Watcha Bringin exists thanks to folks like you. If the app makes
              planning potlucks easier, consider buying me a coffee so I can
              keep the servers humming and ship new goodies.
            </p>
            <a
              href={BUY_ME_A_COFFEE_URL}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-semibold text-black shadow-lg transition hover:bg-yellow-500'
            >
              ☕ Buy Me a Coffee
            </a>
            <div className='pt-4 border-t border-green-100'>
              <p className='text-sm text-gray-500'>
                Prefer email? Reach me at{' '}
                <a
                  href='mailto:privacy@whatcha-bringin.app'
                  className='text-green-600 underline'
                >
                  privacy@whatcha-bringin.app
                </a>
                .
              </p>
              <Link
                href='/'
                className='mt-4 inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-700'
              >
                ← Back to home
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
