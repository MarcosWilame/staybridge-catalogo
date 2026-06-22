import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  MapPin,
  Bed,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Images,
  Clock,
  Scale,
  Share2,
  Heart,
} from 'lucide-react';
import { Property } from '../data/properties';
import { getAvailabilityInfo } from '../utils/availability';
import { getOptimizedImageUrl, preloadImage } from '../utils/cloudinary';
import { shareProperty } from '../utils/shareProperty';
import { trackEvent } from '../utils/analytics';
import { getPropertyImageAlt } from '../utils/imageAlt';
import { formatPropertyType } from '../utils/propertyType';

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

function getPriceValue(price: string) {
  const match = price.match(/\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(',', '.'));
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
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = JSON.parse(localStorage.getItem('staybridge-saved-properties') || '[]') as number[];
      return saved.includes(property.id);
    } catch {
      return false;
    }
  });
  const images = useMemo(
    () => (property.images?.length ? property.images : [property.image]),
    [property.image, property.images]
  );
  const currentImage = images[currentImageIndex] || property.image;
  const hasCarousel = images.length > 1;
  const weeklyPrice = formatWeeklyPrice(property.price);
  const areaPreview = getAreaPreview(property);

  const { label: availabilityLabel, isNow } = getAvailabilityInfo(
    property.moveInDate,
    property.available
  );

  const getPropertyTrackingParams = () => ({
    property_id: property.id,
    property_type: property.type,
    property_category: property.category,
    region: property.region,
    local_area: property.localArea || areaPreview,
    postcode: property.postcode,
    weekly_price: getPriceValue(property.price),
    availability: availabilityLabel,
    available_now: isNow,
    bills_included: property.billsIncluded,
  });

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

  const handleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    try {
      const saved = new Set<number>(JSON.parse(localStorage.getItem('staybridge-saved-properties') || '[]'));
      if (next) saved.add(property.id);
      else saved.delete(property.id);
      localStorage.setItem('staybridge-saved-properties', JSON.stringify(Array.from(saved)));
    } catch {
      // Saving is optional; the card remains fully usable when storage is unavailable.
    }
    trackEvent('property_save', { property_id: property.id, saved: next });
  };

  const trackPropertyOpen = (source: string) => {
    trackEvent('property_detail_click', {
      source,
      ...getPropertyTrackingParams(),
    });
  };

  const showPreviousImage = () => {
    const nextIndex = (currentImageIndex - 1 + images.length) % images.length;
    preloadImage(getOptimizedImageUrl(images[nextIndex], 'card'));
    setCurrentImageIndex((current) =>
      (current - 1 + images.length) % images.length
    );
  };

  const showNextImage = () => {
    const nextIndex = (currentImageIndex + 1) % images.length;
    preloadImage(getOptimizedImageUrl(images[nextIndex], 'card'));
    setCurrentImageIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="premium-card group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--green-dark)]/10 bg-white shadow-[0_16px_50px_rgba(26,77,46,.10)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--green-dark)]/30 hover:shadow-[0_24px_65px_rgba(26,77,46,.18)]">
      {/* Image Container */}
      <div className="relative h-52 shrink-0 overflow-hidden sm:h-56">
        <Link
          to={`/property/${property.id}`}
          className="block h-full"
          onClick={() => trackPropertyOpen('card_image')}
        >
          <ImageWithFallback
            src={getOptimizedImageUrl(currentImage, 'card')}
            alt={getPropertyImageAlt(property, currentImageIndex)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
            width={720}
            height={520}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          />
        </Link>

        {/* Overlay Badges */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-7rem)] flex-col gap-2">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
              isNow
                ? 'bg-[var(--green-dark)] text-white'
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
          <button
            type="button"
            onClick={handleSave}
            className={`rounded-full p-2 shadow-lg transition ${isSaved ? 'bg-[var(--yellow)] text-[var(--green-dark)]' : 'bg-white/95 text-[var(--green-dark)] hover:bg-[var(--yellow)]'}`}
            aria-pressed={isSaved}
            aria-label={isSaved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            title={isSaved ? 'Salvo' : 'Salvar'}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          {onToggleCompare && (
            <button
              type="button"
              onClick={() => onToggleCompare(property)}
              disabled={isCompareDisabled && !isCompareSelected}
              className={`rounded-full p-2 shadow-lg transition ${
                isCompareSelected
                  ? 'bg-[var(--green-dark)] text-white'
                  : 'bg-white/95 text-[var(--green-dark)] hover:bg-[var(--green-dark)] hover:text-white'
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
            className="rounded-full bg-white/95 p-2 text-[var(--green-dark)] shadow-lg transition hover:bg-[var(--green-dark)] hover:text-white"
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
      <div className="flex flex-1 flex-col p-4">
        {/* Type and Region */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--green-dark)] font-bold text-xs uppercase tracking-wide bg-[var(--green-dark)]/10 px-2.5 py-1 rounded-lg">
            <Bed className="w-3.5 h-3.5" />
            <span className="line-clamp-1 break-words">{formatPropertyType(property)}</span>
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

        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--green-dark)]/5 px-3 py-2.5">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-500">Por semana</div>
            <div className="truncate text-2xl font-extrabold leading-tight text-[var(--green-dark)]">
              {weeklyPrice}
            </div>
          </div>
          {property.billsIncluded && (
            <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--green-dark)] shadow-sm">
              Bills inclusas
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          <Link
            to={`/property/${property.id}`}
            onClick={() => trackPropertyOpen('card_button')}
            className="group/button flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-4 py-2.5 text-sm font-black text-[#102c20] shadow-[0_8px_20px_rgba(244,208,63,.20)] transition hover:-translate-y-0.5 hover:bg-[var(--yellow-dark)]"
          >
            <span className="truncate">Ver Detalhes</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover/button:translate-x-1" />
          </Link>
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
