import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getGoogleMapsUrl, PropertyMap } from '../components/PropertyMap';
import { getPropertyAttributes } from '../utils/propertyAttributes';

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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PropertyAttribute {
  icon: LucideIcon;
  label: string;
}

function getLegacyPropertyAttributes(property: Property): PropertyAttribute[] {
  const category = property.category.toLowerCase();
  const type = property.type.toLowerCase();
  const isRoom = ['single', 'double', 'ensuite', 'studio'].some(
    (roomType) => category.includes(roomType) || type.includes(roomType)
  );

  if (!isRoom) {
    return [
      property.bedrooms
        ? { icon: Bed, label: `${property.bedrooms} quartos` }
        : null,
      { icon: Home, label: property.furnishing },
      { icon: Calendar, label: `Entrada: ${property.moveInDate}` },
    ].filter(Boolean) as PropertyAttribute[];
  }

  const attributes: PropertyAttribute[] = [{ icon: Home, label: 'Mobiliado' }];

  if (category.includes('studio') || type.includes('studio')) {
    attributes.push({ icon: CheckCircle, label: 'Bancada, Pia e Armário' });
    attributes.push({ icon: CheckCircle, label: 'Banheiro privativo' });
  } else if (category.includes('ensuite') || type.includes('ensuite')) {
    attributes.push({ icon: CheckCircle, label: 'Banheiro privativo' });
  }

  attributes.push({ icon: Calendar, label: 'Disponível Now' });
  return attributes;
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, isLoading } = useProperties();

  const property = properties.find((p) => p.id === Number(id));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isLoading ? 'Carregando propriedade...' : 'Propriedade não encontrada'}
          </h1>

          {!isLoading && (
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--green-medium)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Propriedades
            </Link>
          )}
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
    setCurrentImageIndex((prev) =>
      (prev + 1) % property.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      (prev - 1 + property.images.length) % property.images.length
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8 pt-20">

      {/* BREADCRUMB + BACK */}
      <div className="bg-[var(--gray-light)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-[var(--green-dark)] transition-colors">
              Início
            </Link>

            <span>/</span>

            <Link to="/properties" className="hover:text-[var(--green-dark)] transition-colors">
              Imóveis
            </Link>

            <span>/</span>

            <span className="text-gray-900 truncate max-w-[220px]">
              {property.title}
            </span>
          </nav>

          {/* Botão voltar mobile */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[var(--green-dark)] transition-colors md:hidden"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* IMAGE GALLERY */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-4">

            <div className="relative h-96 md:h-[600px]">
              <ImageWithFallback
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* NAV BUTTONS */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* COUNTER */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {currentImageIndex + 1} / {property.images.length}
              </div>

              {/* BADGES */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {property.available && (
                  <span className="bg-[var(--yellow)] text-black px-4 py-2 rounded-full text-sm font-bold">
                    Disponível Agora
                  </span>
                )}

                {property.billsIncluded && (
                  <span className="bg-white/95 text-[var(--green-dark)] px-4 py-2 rounded-full text-sm font-bold">
                    Bills Inclusas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-4 gap-2">
            {property.images.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImageIndex === index
                    ? 'border-[var(--green-dark)] scale-105'
                    : 'border-gray-200'
                }`}
              >
                <ImageWithFallback
                  src={image}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN */}
          <div className="lg:col-span-2 space-y-8">

            {/* TITLE */}
            <div>
              <div className="flex items-start justify-between mb-4">

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[var(--green-dark)] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {property.type}
                    </span>

                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.region}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-3 rounded-full border-2 ${
                      isFavorite
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button className="p-3 rounded-full border-2 border-gray-200 text-gray-600">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* INFO */}
              <div className="flex flex-wrap gap-4 text-gray-700">
                {getPropertyAttributes(property).map((attribute) => {
                  const Icon = attribute.icon;

                  return (
                    <div key={attribute.label} className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-[var(--green-dark)]" />
                      <span>{attribute.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-[var(--gray-light)] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[var(--green-dark)] mb-4">
                Descrição
              </h2>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.longDescription}
              </p>
            </div>

            <PropertyMap property={property} />
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] text-white rounded-2xl p-6">

                <div className="text-sm mb-2">Preço por semana</div>

                <div className="text-5xl font-bold mb-4 flex items-start">
                  <PoundSterling className="w-8 h-8 mt-1" />
                  {property.price}
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[var(--yellow)] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>

                <a
                  href={getGoogleMapsUrl(property)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 w-full bg-white/95 text-[var(--green-dark)] py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <MapPin className="w-6 h-6" />
                  Abrir endereço no mapa
                </a>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleWhatsApp}
          className="w-full bg-[var(--green-dark)] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </button>
      </div>

    </div>
  );
}
