export default function Screenshots() {
  const screenshots = [
    { placeholder: 'Screenshot 1: Gatherings List', description: 'View all your gatherings in one place' },
    { placeholder: 'Screenshot 2: Create Gathering', description: 'Easy gathering creation with all the details' },
    { placeholder: 'Screenshot 3: Item Management', description: 'See who\'s bringing what' },
    { placeholder: 'Screenshot 4: Invite Friends', description: 'Send invites with a single tap' },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          See it in action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-2xl p-8 aspect-[9/16] flex flex-col items-center justify-center shadow-lg"
            >
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 text-center font-medium mb-2">
                {screenshot.placeholder}
              </p>
              <p className="text-gray-500 text-sm text-center">
                {screenshot.description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-8 italic">
          Screenshots coming soon! Download the app to see it in action.
        </p>
      </div>
    </section>
  );
}

