import Head from 'next/head';
import Link from 'next/link';

export default function Donate() {
  return (
    <>
      <Head>
        <title>Support Watcha Bringin - Buy Me a Coffee</title>
        <meta
          name='description'
          content='Support the development of Watcha Bringin by buying the developer a coffee!'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-8'>
        <div className='max-w-2xl w-full text-center'>
          <div className='text-8xl mb-6'>☕</div>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
            Support Watcha Bringin
          </h1>
          <p className='text-lg md:text-xl text-gray-600 mb-8 leading-relaxed'>
            Keeping Whatcha Bringin alive and evolving is a one-human labor of
            love — it’s just me over here, building features, squashing bugs,
            and keeping the servers humming. There’s no team, no investors, no
            mysterious benefactors… just a guy with too many ideas and a very
            real hosting bill. If the app has made your life a little easier,
            smoother, or more delightful, tossing a coffee my way truly helps
            keep the lights on (and keeps me caffeinated enough to ship the next
            update).
          </p>
          <p className='text-lg text-gray-600 mb-10 leading-relaxed'>
            Thank you for being part of this quirky little community and for
            cheering on an indie dev doing his best. Your support — whether it’s
            a donation, a kind message, or just opening the app every week —
            means the world. If you’d like to help Whatcha Bringin grow, the
            link below is the most magical button you can press today. 🎉
          </p>
          <a
            href='https://buymeacoffee.com/29s6gtvjb'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl'
          >
            ☕ Buy Me a Coffee
          </a>
          <div className='mt-10'>
            <Link
              href='/'
              className='text-green-600 hover:text-green-700 font-medium'
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
