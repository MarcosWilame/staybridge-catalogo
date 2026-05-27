import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  MapPin,
  Bed,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Images,
  Clock,
} from 'lucide-react';
import { Property } from '../data/properties';
import { getPropertyAttributes } from '../utils/propertyAttributes';
import { getAvailabilityInfo } from '../utils/availability';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.images?.length ? property.images : [property.image];
  const currentImage = images[currentImageIndex] || property.image;
  const hasCarousel = images.length > 1;

  const { label: availabilityLabel, isNow } = getAvailabilityInfo(property.moveInDate);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${property.type} em ${property.region} - ${property.title}`
    );
    window.open(`https://wa.me/447000000000?text=${message}`, '_blank');
  };

  const showPreviousImage = () => {
    setCurrentImageIndex((current) =>
      (current - 1 + images.length) % images.length
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden sm:h-64">
        <Link to={`/property/${property.id}`} className="block h-full">
          <ImageWithFallback
            src={currentImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </Link>

        {/* Overlay Badges */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-7rem)] flex-col gap-2">
          {property.available && (
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                isNow
                  ? 'bg-[var(--yellow)] text-black animate-pulse'
                  : 'bg-white/95 text-[var(--green-dark)] flex items-center gap-1'
              }`}
            >
              {isNow ? (
                '✓ Disponível Agora'
              ) : (
                <>
                  <Clock className="w-3 h-3 shrink-0" />
                  {availabilityLabel}
                </>
              )}
            </span>
          )}
          {property.billsIncluded && (
            <span className="bg-white/95 backdrop-blur text-[var(--green-dark)] px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
              Bills Inclusas
            </span>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="rounded-xl bg-[var(--green-dark)] px-3 py-2 text-white shadow-2xl backdrop-blur-sm md:px-4 md:py-2.5">
            <div className="text-xs opacity-90 font-medium">por semana</div>
            <div className="text-xl font-bold md:text-2xl">{property.price}</div>
          </div>
        </div>

        {hasCarousel && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-all hover:bg-black/70 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-all hover:bg-black/70 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Próxima imagem"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white">
              <Images className="h-3.5 w-3.5" />
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Type and Region */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--green-dark)] font-bold text-xs uppercase tracking-wide bg-[var(--green-dark)]/10 px-2.5 py-1 rounded-lg">
            <Bed className="w-3.5 h-3.5" />
            <span className="line-clamp-1 break-words">{property.type}</span>
          </span>
          <span className="inline-flex min-w-0 max-w-[45%] items-center gap-1 text-gray-600 text-sm font-medium">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1 break-words">{property.region}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[var(--green-dark)] transition-colors leading-tight">
            {property.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {property.description}
        </p>

        {/* Features */}
        <div className="mb-4 max-h-[48px] space-y-1 overflow-hidden">
          {getPropertyAttributes(property).slice(0, 4).map((attribute) => {
            const Icon = attribute.icon;

            return (
              <div
                key={attribute.label}
                className="flex items-start gap-2 text-sm leading-5 text-gray-600"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green-dark)]" />
                <span className="line-clamp-1 break-words">{attribute.label}</span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/property/${property.id}`}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-3 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-[var(--yellow-dark)] md:px-4"
          >
            <span className="truncate">Ver Detalhes</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <button
            onClick={handleWhatsApp}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-3 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[var(--green-medium)] md:px-4"
            title="Falar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
