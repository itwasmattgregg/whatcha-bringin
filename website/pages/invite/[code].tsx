import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildCanonicalUrl, getAbsoluteSocialImage, SITE_NAME } from '../../lib/seo';

type ExtendedWindow = Window & {
  MSStream?: unknown;
  opera?: string;
};

interface Gathering {
  _id: string;
  name: string;
  image?: string;
  date: string;
  time: string;
  address: string;
}

interface InviteData {
  gathering: Gathering;
  invite: {
    code: string;
    status: string;
  };
}

export default function InvitePage() {
  const router = useRouter();
  const { code } = router.query;
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appStoreUrl, setAppStoreUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const extendedWindow = window as ExtendedWindow;
      const userAgent =
        navigator.userAgent || navigator.vendor || extendedWindow.opera || '';
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !extendedWindow.MSStream) {
        setAppStoreUrl('https://apps.apple.com/app/watcha-bringin'); // Placeholder
      } else if (/android/i.test(userAgent)) {
        setAppStoreUrl('https://play.google.com/store/apps/details?id=com.watchabringin'); // Placeholder
      }
    }
  }, []);

  useEffect(() => {
    if (!code || typeof code !== 'string') return;

    const fetchInvite = async () => {
      try {
        setLoading(true);
        // Use the API URL from environment or default to localhost for development
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/invites/${code}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invite not found. Please check the invite code and try again.');
          } else {
            setError('Failed to load invite. Please try again later.');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setInviteData(data);
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Failed to load invite. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [code]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const canonicalUrl = buildCanonicalUrl(router.asPath?.split('?')[0] || '/invite');
  const socialImage = getAbsoluteSocialImage();

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Invite - Watcha Bringin</title>
          <link rel="canonical" href={canonicalUrl} />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invite...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !inviteData) {
    return (
      <>
        <Head>
          <title>Invite Not Found - Watcha Bringin</title>
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Invite Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The invite you\'re looking for doesn\'t exist or has expired.'}</p>
            <Link
              href="/"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </main>
      </>
    );
  }

  const { gathering } = inviteData;

  return (
    <>
      <Head>
        <title>You're Invited to {gathering.name} - Watcha Bringin</title>
        <meta
          name="description"
          content={`You're invited to ${gathering.name} on ${formatDate(gathering.date)} at ${gathering.time}. Join us in Watcha Bringin!`}
        />
        <meta property="og:title" content={`You're Invited to ${gathering.name} - ${SITE_NAME}`} />
        <meta
          property="og:description"
          content={`Join the ${gathering.name} gathering on Watcha Bringin. View the invite for details and download the app to RSVP.`}
        />
        <meta property="og:image" content={socialImage} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`You're Invited to ${gathering.name} - ${SITE_NAME}`} />
        <meta
          name="twitter:description"
          content={`Join ${gathering.name} on Watcha Bringin to see what everyone is bringing.`}
        />
        <meta name="twitter:image" content={socialImage} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">🎉 You're Invited!</h1>
            <p className="text-xl text-gray-600">Join us in Watcha Bringin</p>
          </div>

          {/* Gathering Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {gathering.image && (
              <div className="w-full h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="text-6xl">📸</span>
              </div>
            )}
            
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">{gathering.name}</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📅</span>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Date & Time</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(gathering.date)} at {gathering.time}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-2xl mr-3">📍</span>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Location</p>
                    <p className="text-lg font-semibold text-gray-800">{gathering.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Invite Code:</strong>
                </p>
                <p className="text-2xl font-mono font-bold text-green-600 text-center">
                  {inviteData.invite.code}
                </p>
              </div>
            </div>
          </div>

          {/* Download CTA */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Download Watcha Bringin to Join!
            </h3>
            <p className="text-gray-600 mb-6">
              Use the invite code <strong className="font-mono text-green-600">{inviteData.invite.code}</strong> in the app to join this gathering.
            </p>
            
            {isClient && appStoreUrl ? (
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Download App
              </a>
            ) : (
              <div className="space-y-3">
                <a
                  href="https://apps.apple.com/app/watcha-bringin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-black hover:bg-gray-800 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
                >
                  Download for iOS
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.watchabringin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
                >
                  Download for Android
                </a>
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

