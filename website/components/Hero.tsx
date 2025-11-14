import { useEffect, useState } from 'react';

type ExtendedWindow = Window & {
  MSStream?: unknown;
  opera?: string;
};

export default function Hero() {
  const [appStoreUrl, setAppStoreUrl] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [osName, setOsName] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const extendedWindow = window as ExtendedWindow;
      const userAgent =
        navigator.userAgent || navigator.vendor || extendedWindow.opera || '';
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !extendedWindow.MSStream) {
        setOsName('iOS');
        setAppStoreUrl('https://apps.apple.com/app/watcha-bringin'); // Placeholder
      } else if (/android/i.test(userAgent)) {
        setOsName('Android');
        setAppStoreUrl('https://play.google.com/store/apps/details?id=com.watchabringin'); // Placeholder
      }
    }
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Watcha Bringin? 🎉
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
          Plan perfect potluck gatherings with friends. No more duplicate dishes,
          no more confusion—just good food and great times.
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Coordinate who's bringing what, send invites via text, and make every
          gathering a delicious success!
        </p>

        {isClient && appStoreUrl ? (
          <a
            href={appStoreUrl}
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl mb-4"
          >
            Download on {osName === 'iOS' ? 'App Store' : 'Google Play'}
          </a>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://apps.apple.com/app/watcha-bringin"
              className="inline-block bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Download on App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.watchabringin"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get it on Google Play
            </a>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-600 text-base">
          <a
            href="/support"
            className="hover:text-gray-800 font-medium"
          >
            🙋 Need Help?
          </a>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a
            href="/donate"
            className="hover:text-gray-800 font-medium"
          >
            ☕ Support the developer
          </a>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a
            href="/privacy"
            className="hover:text-gray-800 font-medium"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </section>
  );
}

