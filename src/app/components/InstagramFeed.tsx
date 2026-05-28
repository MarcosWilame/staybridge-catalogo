import { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

const carouselImages = [
  './img/01.jpg',
  './img/02.jpg',
  './img/03.jpg',
  './img/04.jpg',
  './img/05.jpg',
];

const staticPosts = [
  {
    image: './img/06.png',
    likes: 189,
  },
  {
    image: './img/07.png',
    likes: 312,
  },
];

function CarouselCard() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href="https://instagram.com/staybridge_london"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {carouselImages.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Carousel ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Indicadores */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
        {carouselImages.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'
            }`}
          />
        ))}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
        <div className="text-white flex items-center gap-2">
          <Instagram className="w-5 h-5" />
          <span className="font-semibold text-sm">Ver no Instagram</span>
        </div>
      </div>
    </a>
  );
}

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

        {/* Instagram Grid — 3 cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
          {/* Card 1: carrossel automático */}
          <CarouselCard />

          {/* Cards 2 e 3: fotos estáticas */}
          {staticPosts.map((post, index) => (
            <a
              key={index}
              href="https://instagram.com/staybridge_london"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={post.image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
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
            href="https://instagram.com/staybridge_london"
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
