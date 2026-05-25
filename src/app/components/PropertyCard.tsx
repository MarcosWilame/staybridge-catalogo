import { Link } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Bed, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { Property } from '../data/properties';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${property.type} em ${property.region} - ${property.title}`
    );
    window.open(`https://wa.me/447000000000?text=${message}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[var(--green-dark)] hover:-translate-y-1">
      {/* Image Container */}
      <Link to={`/property/${property.id}`} className="block relative h-64 overflow-hidden">
        <ImageWithFallback
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.available && (
            <span className="bg-[var(--yellow)] text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">✓ Disponível Agora</span>
          )}
          {property.billsIncluded && (
            <span className="bg-white/95 backdrop-blur text-[var(--green-dark)] px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
              Bills Inclusas
            </span>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-[var(--green-dark)] text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-sm">
            <div className="text-xs opacity-90 font-medium">por semana</div>
            <div className="text-2xl font-bold">{property.price}</div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Type and Region */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-[var(--green-dark)] font-bold text-xs uppercase tracking-wide bg-[var(--green-dark)]/10 px-2.5 py-1 rounded-lg">
            <Bed className="w-3.5 h-3.5" />
            {property.type}
          </span>
          <span className="inline-flex items-center gap-1 text-gray-600 text-sm font-medium">
            <MapPin className="w-4 h-4 text-gray-400" />
            {property.region}
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
        {property.bedrooms && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <CheckCircle className="w-4 h-4 text-[var(--green-dark)]" />
            <span>{property.bedrooms} {property.bedrooms === 1 ? 'quarto' : 'quartos'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/property/${property.id}`}
            className="flex-1 bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm hover:scale-105"
          >
            Ver Detalhes
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleWhatsApp}
            className="bg-[var(--green-dark)] hover:bg-[var(--green-medium)] text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
            title="Falar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
