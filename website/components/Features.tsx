export default function Features() {
  const features = [
    {
      emoji: '📱',
      title: 'Easy Invites',
      description: 'Send invites via text message. No complicated sign-ups needed!',
    },
    {
      emoji: '🍽️',
      title: 'Item Coordination',
      description: 'See who\'s bringing what at a glance. Claim items and add your own custom dishes.',
    },
    {
      emoji: '🎨',
      title: 'Custom Gatherings',
      description: 'Create gatherings with custom names, images, dates, and locations.',
    },
    {
      emoji: '✨',
      title: 'Simple & Fun',
      description: 'Designed to be whimsical and quippy—just like your gatherings should be!',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Everything you need for the perfect potluck
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

