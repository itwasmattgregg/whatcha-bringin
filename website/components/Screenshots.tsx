import Image from 'next/image';

export default function Screenshots() {
  const screenshots = [
    {
      src: '/demo_gatherings.png',
      title: 'Stay on top of every gathering',
      description:
        'View all of your upcoming events and key details in one place.',
    },
    {
      src: '/demo_create.png',
      title: 'Create gatherings in seconds',
      description:
        'Add the where and when, then invite your crew without juggling multiple apps.',
    },
    {
      src: '/demo_items.png',
      title: 'Track who’s bringing what',
      description:
        'Assign dishes, stop duplicates, and still give friends the freedom to spotlight their signature dishes.',
    },
    {
      src: '/demo_share.png',
      title: 'Share invites instantly',
      description: 'Send invites via text so friends can join in the app.',
    },
  ];

  return (
    <section className='py-20 px-4 bg-gradient-to-b from-white to-green-50'>
      <div className='max-w-7xl mx-auto'>
        <h2 className='text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16'>
          See it in action
        </h2>
        <p className='text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12'>
          Real screenshots straight from the Watcha Bringin? app. See how easy
          it is to plan unforgettable potlucks without the spreadsheet headache.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className='bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col'
            >
              <div className='relative w-full overflow-hidden rounded-[36px] bg-gray-900 aspect-[9/19] shadow-inner'>
                <Image
                  src={screenshot.src}
                  alt={screenshot.title}
                  fill
                  className='object-cover'
                  sizes='(min-width: 768px) 45vw, 90vw'
                  priority={index === 0}
                />
              </div>
              <div className='mt-6 text-center px-4'>
                <p className='text-xl font-semibold text-gray-900 mb-2'>
                  {screenshot.title}
                </p>
                <p className='text-gray-500 text-base'>
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
