import Head from 'next/head';
import Link from 'next/link';

export default function Donate() {
  return (
    <>
      <Head>
        <title>Support Watcha Bringin - Buy Me a Coffee</title>
        <meta
          name="description"
          content="Support the development of Watcha Bringin by buying the developer a coffee!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="text-8xl mb-6">☕</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Support Watcha Bringin
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            If you're enjoying Watcha Bringin and want to support its development,
            consider buying me a coffee! Every contribution helps keep the app running
            and allows me to add new features.
          </p>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed">
            Thank you for being part of the Watcha Bringin community! 🎉
          </p>
          <a
            href="https://buymeacoffee.com/29s6gtvjb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            ☕ Buy Me a Coffee
          </a>
          <div className="mt-10">
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

