import { useEffect, useMemo, useState } from 'react';
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
  Scale,
  Share2,
} from 'lucide-react';
import { Property } from '../data/properties';
import { getPropertyAttributes } from '../utils/propertyAttributes';
import { getAvailabilityInfo } from '../utils/availability';
import { getOptimizedImageUrl, preloadImage } from '../utils/cloudinary';
import { WHATSAPP_URL } from '../config/contact';
import { shareProperty } from '../utils/shareProperty';
import { trackEvent } from '../utils/analytics';

interface PropertyCardProps {
  property: Property;
  isCompareSelected?: boolean;
  isCompareDisabled?: boolean;
  onToggleCompare?: (property: Property) => void;
}

function formatWeeklyPrice(price: string) {
  const cleanedPrice = price.trim();
  const amountMatch = cleanedPrice.match(/£?\s*\d+(?:[.,]\d+)?/);
  const amount = amountMatch
    ? amountMatch[0].replace(/^£?\s*/, '')
    : cleanedPrice.replace(/\/?\s*week/i, '').replace(/^£\s*/, '');

  return amount.startsWith('£') ? amount : `£${amount}`;
}

const postcodeAreaByDistrict: Record<string, string> = {
  HA2: 'Harrow',
  NW2: 'Neasden',
  NW10: 'Dollis Hill',
  SE25: 'Croydon',
  SW16: 'Streatham',
};

function extractPostcodeDistrict(property: Property) {
  const postcodeSource = [property.postcode, property.title, property.address]
    .filter(Boolean)
    .join(' ');
  const match = postcodeSource.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?)\s*\d[A-Z]{2}\b/i);

  return match?.[1]?.toUpperCase() || '';
}

function extractAreaFromText(property: Property) {
  const textSource = [property.description, property.longDescription]
    .filter(Boolean)
    .join(' ');
  const match = textSource.match(/\b(?:em|in)\s+([A-ZÀ-Ý][\wÀ-ÿ'-]+(?:\s+[A-ZÀ-Ý][\wÀ-ÿ'-]+){0,2})/);

  return match?.[1]?.replace(/\.$/, '').trim() || '';
}

function getAreaPreview(property: Property) {
  const postcodeDistrict = extractPostcodeDistrict(property);
  const postcodeArea = postcodeAreaByDistrict[postcodeDistrict];
  const textArea = extractAreaFromText(property);
  const station = property.nearbyStations?.[0]
    ?.replace(/\s+Station$/i, '')
    .trim();

  return property.localArea || textArea || station || postcodeArea || property.region;
}

export function PropertyCard({
  property,
  isCompareSelected = false,
  isCompareDisabled = false,
  onToggleCompare,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareStatus, setShareStatus] = useState('');
  const images = useMemo(
    () => (property.images?.length ? property.images : [property.image]),
    [property.image, property.images]
  );
  const currentImage = images[currentImageIndex] || property.image;
  const hasCarousel = images.length > 1;
  const weeklyPrice = formatWeeklyPrice(property.price);
  const areaPreview = getAreaPreview(property);

  const { label: availabilityLabel, isNow } = getAvailabilityInfo(property.moveInDate);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${property.type} em ${property.region} - ${property.title}`
    );
    trackEvent('whatsapp_click', {
      source: 'property_card',
      property_id: property.id,
      property_type: property.type,
      region: property.region,
    });
    window.open(`${WHATSAPP_URL}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    try {
      const result = await shareProperty(property);
      trackEvent('property_share', {
        source: 'property_card',
        method: result,
        property_id: property.id,
      });
      setShareStatus(result === 'copied' ? 'Link copiado' : 'Compartilhado');
      window.setTimeout(() => setShareStatus(''), 1800);
    } catch {
      setShareStatus('Nao foi possivel compartilhar');
      window.setTimeout(() => setShareStatus(''), 1800);
    }
  };

  const trackPropertyOpen = (source: string) => {
    trackEvent('property_detail_click', {
      source,
      property_id: property.id,
      property_type: property.type,
      region: property.region,
      price: property.price,
    });
  };

  const showPreviousImage = () => {
    setCurrentImageIndex((current) =>
      (current - 1 + images.length) % images.length
    );
  };

  const showNextImage = () => {
    setCurrentImageIndex((current) => (current + 1) % images.length);
  };

  useEffect(() => {
    if (!hasCarousel) return;

    const nextImage = images[(currentImageIndex + 1) % images.length];
    const previousImage =
      images[(currentImageIndex - 1 + images.length) % images.length];

    preloadImage(getOptimizedImageUrl(nextImage, 'card'));
    preloadImage(getOptimizedImageUrl(previousImage, 'card'));
  }, [currentImageIndex, hasCarousel, images]);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl">
      {/* Image Container */}
      <div className="relative h-56 shrink-0 overflow-hidden sm:h-64">
        <Link
          to={`/property/${property.id}`}
          className="block h-full"
          onClick={() => trackPropertyOpen('card_image')}
        >
          <ImageWithFallback
            src={getOptimizedImageUrl(currentImage, 'card')}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Overlay Badges */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-7rem)] flex-col gap-2">
          {property.available && (
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                isNow
                  ? 'bg-[var(--yellow)] text-black'
                  : 'bg-white/95 text-[var(--green-dark)] flex items-center gap-1'
              }`}
            >
              {isNow ? (
                availabilityLabel
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
        <div className="absolute bottom-3 right-3 hidden sm:block">
          <div className="rounded-xl bg-[var(--green-dark)] px-3 py-2 text-white shadow-2xl backdrop-blur-sm md:px-4 md:py-2.5">
            <div className="text-xs font-medium uppercase tracking-wide opacity-90">Week</div>
            <div className="text-xl font-bold md:text-2xl">{weeklyPrice}</div>
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

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(property)}
              disabled={isCompareDisabled && !isCompareSelected}
              className={`rounded-full p-2 shadow-lg transition ${
                isCompareSelected
                  ? 'bg-[var(--yellow)] text-black'
                  : 'bg-white/95 text-[var(--green-dark)] hover:bg-[var(--yellow)]'
              } disabled:cursor-not-allowed disabled:opacity-50`}
              aria-pressed={isCompareSelected}
              aria-label={isCompareSelected ? 'Remover da comparacao' : 'Adicionar a comparacao'}
              title={isCompareSelected ? 'Remover da comparacao' : 'Comparar'}
            >
              <Scale className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-white/95 p-2 text-[var(--green-dark)] shadow-lg transition hover:bg-[var(--yellow)] hover:text-black"
            aria-label="Compartilhar imovel"
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {/* Type and Region */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--green-dark)] font-bold text-xs uppercase tracking-wide bg-[var(--green-dark)]/10 px-2.5 py-1 rounded-lg">
            <Bed className="w-3.5 h-3.5" />
            <span className="line-clamp-1 break-words">{property.type}</span>
          </span>
          <span className="inline-flex min-w-0 max-w-[45%] items-center gap-1 text-gray-600 text-sm font-medium">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1 break-words">{areaPreview}</span>
          </span>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`} onClick={() => trackPropertyOpen('card_title')}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[var(--green-dark)] transition-colors leading-tight">
            {property.title}
          </h3>
        </Link>

        <div className="mb-3 flex items-end justify-between gap-3 rounded-xl bg-[var(--green-dark)]/5 px-3 py-2 sm:hidden">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Week</div>
            <div className="truncate text-2xl font-extrabold leading-tight text-[var(--green-dark)]">
              {weeklyPrice}
            </div>
          </div>
          {property.available && (
            <div
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                isNow
                  ? 'bg-[var(--yellow)] text-black'
                  : 'bg-white text-[var(--green-dark)]'
              }`}
            >
              {availabilityLabel}
            </div>
          )}
        </div>

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
        <div className="mt-auto flex gap-2">
          <Link
            to={`/property/${property.id}`}
            onClick={() => trackPropertyOpen('card_button')}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-3 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-[var(--yellow-dark)] md:hover:scale-105 md:px-4"
          >
            <span className="truncate">Ver Detalhes</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <button
            onClick={handleWhatsApp}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-3 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--green-medium)] md:hover:scale-105 md:px-4"
            title="Falar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="sm:hidden">WhatsApp</span>
          </button>
        </div>

        {shareStatus && (
          <div className="mt-3 rounded-lg bg-[var(--green-dark)]/10 px-3 py-2 text-center text-xs font-bold text-[var(--green-dark)]">
            {shareStatus}
          </div>
        )}
      </div>
    </div>
  );
}
