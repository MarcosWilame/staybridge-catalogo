import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { properties } from '../data/properties';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

import {
  ArrowLeft,
  MapPin,
  Bed,
  CheckCircle,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  PoundSterling,
  Home,
  Train,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function PropertyDetailsPage() {
  const { id } = useParams();

  const property = properties.find(
    (p) => p.id === Number(id)
  );

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [isFavorite, setIsFavorite] =
    useState(false);

  // VOLTA PARA O TOPO AO ABRIR A PÁGINA
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Propriedade não encontrada
          </h1>

          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--green-medium)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Propriedades
          </Link>
        </div>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${property.type} em ${property.region} - ${property.title} (ID: ${property.id})`
    );

    window.open(
      `https://wa.me/447000000000?text=${message}`,
      '_blank'
    );
  };

  const nextImage = () => {
    setCurrentImageIndex(
      (prev) =>
        (prev + 1) % property.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + property.images.length) %
        property.images.length
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8 pt-20">
      {/* Back Button */}
      <div className="bg-[var(--gray-light)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 text-[var(--green-dark)] hover:text-[var(--green-medium)] font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Propriedades
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4">
            <div className="relative h-96 md:h-[600px]">
              <ImageWithFallback
                src={
                  property.images[currentImageIndex]
                }
                alt={`${property.title} - Image ${
                  currentImageIndex + 1
                }`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {currentImageIndex + 1} /{' '}
                {property.images.length}
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {property.available && (
                  <span className="bg-[var(--yellow)] text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Disponível Agora
                  </span>
                )}

                {property.billsIncluded && (
                  <span className="bg-white/95 backdrop-blur text-[var(--green-dark)] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Bills Inclusas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2">
            {property.images
              .slice(0, 4)
              .map((image, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentImageIndex(index)
                  }
                  className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? 'border-[var(--green-dark)] scale-105'
                      : 'border-gray-200 hover:border-[var(--green-dark)]'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Thumbnail ${
                      index + 1
                    }`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Actions */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[var(--green-dark)] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {property.type}
                    </span>

                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.region}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setIsFavorite(!isFavorite)
                    }
                    className={`p-3 rounded-full border-2 transition-all ${
                      isFavorite
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-200 text-gray-600 hover:border-[var(--green-dark)]'
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isFavorite
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  </button>

                  <button className="p-3 rounded-full border-2 border-gray-200 text-gray-600 hover:border-[var(--green-dark)] transition-all">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Key Info */}
              <div className="flex flex-wrap gap-4 text-gray-700">
                {property.bedrooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[var(--green-dark)]" />

                    <span>
                      {property.bedrooms}{' '}
                      {property.bedrooms === 1
                        ? 'quarto'
                        : 'quartos'}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-[var(--green-dark)]" />
                  <span>
                    {property.furnishing}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--green-dark)]" />

                  <span>
                    Entrada:{' '}
                    {property.moveInDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[var(--gray-light)] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[var(--green-dark)] mb-4">
                Descrição
              </h2>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.longDescription}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white rounded-2xl p-6 shadow-2xl">
                <div className="text-sm opacity-90 mb-2">
                  Preço por semana
                </div>

                <div className="text-5xl font-bold mb-4 flex items-start">
                  <PoundSterling className="w-8 h-8 mt-1" />

                  {property.price}
                </div>

                <div className="bg-white/20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Depósito</span>

                    <span className="font-semibold">
                      £{property.deposit}
                    </span>
                  </div>

                  {property.billsIncluded && (
                    <div className="flex items-center gap-2 mt-2 text-[var(--yellow)]">
                      <CheckCircle className="w-4 h-4" />

                      <span className="text-sm font-semibold">
                        Bills inclusas
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>

                <p className="text-xs text-white/80 text-center mt-3">
                  Resposta rápida em português
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-30">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              Por semana
            </div>

            <div className="text-2xl font-bold text-[var(--green-dark)]">
              £{property.price}
            </div>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex-shrink-0 bg-[var(--green-dark)] hover:bg-[var(--green-medium)] text-white py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}