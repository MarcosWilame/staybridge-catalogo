import { Instagram } from 'lucide-react';

const instagramPosts = [
  {
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    likes: 234,
  },
  {
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400',
    likes: 189,
  },
  {
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=400',
    likes: 312,
  },
  {
    image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=400',
    likes: 267,
  },
  {
    image: 'https://images.unsplash.com/photo-1632743441209-8a09b8a37e25?w=400',
    likes: 421,
  },
  {
    image: 'https://images.unsplash.com/photo-1595846723416-99a641e1231a?w=400',
    likes: 198,
  },
];

export function InstagramFeed() {
  return (
    <section className="bg-[var(--gray-light)] py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center md:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            <Instagram className="w-4 h-4" />
            @staybridgelondon
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-4xl">
            Siga-nos no
            <br />
            <span className="text-[var(--yellow)]">Instagram</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Veja mais fotos das nossas propriedades e dicas para morar em Londres
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {instagramPosts.map((post, index) => (
            <a
              key={index}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={post.image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="text-white flex items-center gap-2">
                  <Instagram className="w-5 h-5" />
                  <span className="font-semibold">{post.likes}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Follow Button */}
        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl sm:w-auto md:px-8 md:py-4"
          >
            <Instagram className="w-5 h-5" />
            Seguir @staybridgelondon
          </a>
        </div>
      </div>
    </section>
  );
}
