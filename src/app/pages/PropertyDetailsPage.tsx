import { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { PropertyMap } from '../components/PropertyMap';
import { getPropertyAttributes } from '../utils/propertyAttributes';
import { getAvailabilityInfo } from '../utils/availability';
import { getOptimizedImageUrl, preloadImage } from '../utils/cloudinary';
import { SEO } from '../components/SEO';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import type { LeadIntent } from '../utils/leadCapture';
import { getPropertyImageAlt } from '../utils/imageAlt';
import { formatPropertyType } from '../utils/propertyType';
import { getAbsoluteUrl } from '../config/site';
import { trackEvent } from '../utils/analytics';
import { isIllustrativePropertyImage } from '../utils/propertyMedia';
import { parsePropertyDescription } from '../utils/propertyDescription';

import {
  ArrowLeft,
  MapPin,
  Bed,
  CheckCircle,
  MessageCircle,
  Share2,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  Bus,
  ShoppingBasket,
  Pill,
  TrainFront,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { shareProperty } from '../utils/shareProperty';

interface PropertyAttribute {
  icon: LucideIcon;
  label: string;
}

type MediaItem =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; embedSrc: string };

function getVideoEmbedUrl(url: string) {
  const driveFileId =
    url.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1] ||
    url.match(/drive\.google\.com\/uc\?[^#]*id=([^&#]+)/)?.[1] ||
    url.match(/drive\.google\.com\/open\?[^#]*id=([^&#]+)/)?.[1] ||
    '';

  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  const youtubeId =
    url.match(/youtube\.com\/watch\?[^#]*v=([^&#]+)/)?.[1] ||
    url.match(/youtu\.be\/([^?&#]+)/)?.[1] ||
    '';

  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  return url;
}

function getMediaItems(property: Property): MediaItem[] {
  const imageItems = (property.images?.length ? property.images : [property.image])
    .filter(Boolean)
    .map((src) => ({ type: 'image' as const, src }));

  if (!property.video) return imageItems;

  return [
    ...imageItems,
    {
      type: 'video' as const,
      src: property.video,
      embedSrc: getVideoEmbedUrl(property.video),
    },
  ];
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

function getNearbyIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes('bus')) return Bus;
  if (
    normalized.includes('sainsbury') ||
    normalized.includes('market') ||
    normalized.includes('supermarket')
  ) {
    return ShoppingBasket;
  }
  if (normalized.includes('pharmacy') || normalized.includes('farmácia')) {
    return Pill;
  }
  if (normalized.includes('station') || normalized.includes('junction')) {
    return TrainFront;
  }

  return MapPin;
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, isLoading } = useProperties();

  const property = properties.find((p) => p.id === Number(id));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareStatus, setShareStatus] = useState('');
  const [leadIntent, setLeadIntent] = useState<LeadIntent>('whatsapp');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const mediaItems = useMemo(
    () => (property ? getMediaItems(property) : []),
    [property]
  );
  const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];
  const videoThumbnail = property ? property.image || property.images[0] : '';

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setCurrentImageIndex(0);

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [id, property?.id]);

  const propertyNotFoundContent = !property ? (
      <div className="min-h-screen flex items-center justify-center">
        {!isLoading && (
          <SEO
            noIndex
            title="Imóvel não encontrado"
            description="Este imóvel não está disponível no catálogo. Consulte outras acomodações em Londres."
          />
        )}
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
    ) : null;

  const { label: availabilityLabel, isNow } = property
    ? getAvailabilityInfo(property.moveInDate, property.available)
    : { label: '', isNow: false };
  const weeklyPrice = property ? formatWeeklyPrice(property.price) : '';
  const nearbyHighlights = property
    ? property.nearbyStations.filter((item) => item.trim().length > 0)
    : [];
  const descriptionContent = parsePropertyDescription(
    property?.longDescription || property?.description || ''
  );

  const openLeadForm = (intent: LeadIntent, source: string) => {
    setLeadIntent(intent);
    setIsLeadFormOpen(true);
    trackEvent('lead_cta_click', {
      source,
      intent,
      property_id: property?.id,
    });
  };

  const handleShare = async () => {
    if (!property) return;

    try {
      const result = await shareProperty(property);
      trackEvent('property_share', {
        source: 'property_details',
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

  useEffect(() => {
    if (!property) return;

    const imageItems = mediaItems.filter(
      (item): item is Extract<MediaItem, { type: 'image' }> => item.type === 'image'
    );

    imageItems.slice(0, 4).forEach((item) => {
      preloadImage(getOptimizedImageUrl(item.src, 'detail'));
    });
  }, [mediaItems, property]);

  useEffect(() => {
    if (!property) return;

    if (mediaItems.length < 2) return;

    const nextItem = mediaItems[(currentImageIndex + 1) % mediaItems.length];
    const previousItem =
      mediaItems[(currentImageIndex - 1 + mediaItems.length) % mediaItems.length];

    [nextItem, previousItem].forEach((item) => {
      if (item?.type === 'image') {
        preloadImage(getOptimizedImageUrl(item.src, 'detail'));
      }
    });
  }, [currentImageIndex, mediaItems, property]);

  if (!property) return propertyNotFoundContent;

  const propertyDescription =
    property.description ||
    `${formatPropertyType(property)} em ${property.region} com atendimento em português.`;
  const propertyUrl = getAbsoluteUrl(`/property/${property.id}`);
  const residenceId = `${propertyUrl}#residence`;
  const listingId = `${propertyUrl}#listing`;
  const isApartment = ['flat', 'studio', 'apartment'].includes(
    property.category.toLowerCase()
  );
  const propertyImages = Array.from(
    new Set([property.image, ...(property.images || [])].filter(Boolean))
  );
  const hasValidCoordinates =
    Number.isFinite(property.coordinates?.lat) &&
    Number.isFinite(property.coordinates?.lng) &&
    property.coordinates.lat !== 0 &&
    property.coordinates.lng !== 0;
  const propertyJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        '@id': listingId,
        name: property.title,
        headline: `${property.title} para alugar em ${property.region}`,
        description: propertyDescription,
        url: propertyUrl,
        image: propertyImages,
        inLanguage: ['pt-BR', 'en-GB'],
        mainEntity: { '@id': residenceId },
        offers: {
          '@type': 'Offer',
          url: propertyUrl,
          price: getPriceValue(property.price),
          priceCurrency: 'GBP',
          availability: property.available
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemOffered: { '@id': residenceId },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: getPriceValue(property.price),
            priceCurrency: 'GBP',
            unitText: 'WEEK',
            billingDuration: 1,
            billingIncrement: 1,
          },
          seller: { '@id': `${getAbsoluteUrl('/')}#business` },
        },
      },
      {
        '@type': isApartment ? ['Residence', 'Apartment'] : 'Residence',
        '@id': residenceId,
        name: property.title,
        description: property.longDescription || propertyDescription,
        url: propertyUrl,
        image: propertyImages,
        address: {
          '@type': 'PostalAddress',
          addressLocality: property.localArea || property.region,
          addressRegion: 'London',
          postalCode: property.postcode,
          addressCountry: 'GB',
        },
        ...(hasValidCoordinates
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: property.coordinates.lat,
                longitude: property.coordinates.lng,
              },
            }
          : {}),
        numberOfBedrooms: property.bedrooms,
        numberOfBathroomsTotal: property.bathrooms,
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: property.people,
          unitText: 'PERSON',
        },
        accommodationCategory: property.type,
        amenityFeature: [
          ...property.amenities.map((amenity) => ({
            '@type': 'LocationFeatureSpecification',
            name: amenity,
            value: true,
          })),
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Bills inclusas',
            value: property.billsIncluded,
          },
          {
            '@type': 'LocationFeatureSpecification',
            name: 'Furnished',
            value: Boolean(property.furnishing),
          },
        ],
      },
    ],
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: getAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Imoveis',
        item: getAbsoluteUrl('/properties'),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.title,
        item: getAbsoluteUrl(`/property/${property.id}`),
      },
    ],
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      (prev + 1) % mediaItems.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      (prev - 1 + mediaItems.length) % mediaItems.length
    );
  };

  return (
    <div className="premium-page min-h-screen bg-[#f7f4df] pb-44 pt-20 md:pb-8">
      <SEO
        title={`${property.title} em ${property.region}`}
        description={`${propertyDescription} Valor ${weeklyPrice}. ${availabilityLabel}.`}
        image={property.image}
        imageAlt={`${property.title} para alugar em ${property.region}`}
        type="article"
        canonicalPath={`/property/${property.id}`}
        jsonLd={[propertyJsonLd, breadcrumbJsonLd]}
      />

      {/* BREADCRUMB + BACK */}
      <div className="bg-[var(--gray-light)] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-3">
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
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:px-8">

        {/* IMAGE GALLERY */}
        <div className="mb-6 md:mb-8 lg:order-1 lg:col-span-2 lg:mb-0">
          <div className="premium-media relative mb-4 overflow-hidden rounded-xl shadow-xl md:rounded-2xl md:shadow-2xl">

            <div className="relative h-72 sm:h-96 lg:h-[520px]">
              {currentMedia?.type === 'video' ? (
                <iframe
                  src={currentMedia.embedSrc}
                  title={`${property.title} - Video`}
                  className="h-full w-full border-0 bg-black"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <ImageWithFallback
                  src={getOptimizedImageUrl(currentMedia?.src || property.image, 'detail')}
                  alt={getPropertyImageAlt(property, currentImageIndex)}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              )}

              {/* NAV BUTTONS */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Ver imagem anterior do imóvel"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 md:left-4 md:p-3"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Ver próxima imagem do imóvel"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 md:right-4 md:p-3"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* COUNTER */}
              <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-sm font-semibold text-white md:bottom-4 md:right-4 md:px-4 md:py-2">
                {currentImageIndex + 1} / {mediaItems.length}
              </div>

              {/* BADGES */}
              <div className="absolute left-3 top-3 flex max-w-[calc(100%-6rem)] flex-col gap-2 md:left-4 md:top-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold md:px-4 md:py-2 md:text-sm ${
                    isNow
                      ? 'bg-[var(--green-dark)] text-white'
                      : 'bg-white/95 text-[var(--green-dark)] flex items-center gap-1.5'
                  }`}
                >
                  {isNow ? (
                    availabilityLabel
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {availabilityLabel}
                    </>
                  )}
                </span>

                {currentMedia?.type === 'image' && isIllustrativePropertyImage(currentMedia.src) && (
                  <span className="w-fit rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                    Imagem ilustrativa
                  </span>
                )}

                {property.billsIncluded && (
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[var(--green-dark)] md:px-4 md:py-2 md:text-sm">
                    Bills inclusas
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {mediaItems.slice(0, 8).map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                aria-label={item.type === 'video' ? `Reproduzir vídeo de ${property.title}` : `Ver ${getPropertyImageAlt(property, index)}`}
                aria-current={currentImageIndex === index ? 'true' : undefined}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all md:h-24 md:aspect-auto ${
                  currentImageIndex === index
                    ? 'border-[var(--green-dark)] scale-105'
                    : 'border-gray-200'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="relative h-full w-full bg-black">
                    <ImageWithFallback
                      src={getOptimizedImageUrl(videoThumbnail, 'thumb')}
                      alt=""
                      className="h-full w-full object-cover opacity-60"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Play className="h-7 w-7 fill-current" />
                    </div>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={getOptimizedImageUrl(item.src, 'thumb')}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:contents">

          {/* MAIN */}
          <div className="space-y-8 lg:order-3 lg:col-span-2 lg:mt-8">

            {/* TITLE */}
            <div className="lg:hidden">
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="max-w-full rounded-full bg-[var(--green-dark)] px-3 py-1.5 text-sm font-bold leading-snug text-white">
                      {formatPropertyType(property)}
                    </span>

                    <span className="flex min-w-0 items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="break-words">{property.region}</span>
                    </span>

                    {/* Availability inline badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                        isNow
                          ? 'bg-[var(--green-dark)] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {!isNow && <Clock className="h-3.5 w-3.5 shrink-0" />}
                      {availabilityLabel}
                    </span>
                  </div>

                  <h1 className="break-words text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
                    {property.title}
                  </h1>
                </div>

                <div className="relative flex shrink-0 gap-2">
                  <button
                    onClick={handleShare}
                    className="rounded-full border-2 border-gray-200 p-3 text-gray-600 transition hover:border-[var(--green-dark)] hover:text-[var(--green-dark)]"
                    aria-label="Compartilhar imovel"
                    title="Compartilhar"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>

                  {shareStatus && (
                    <div className="absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg bg-[var(--green-dark)] px-3 py-2 text-xs font-bold text-white shadow-lg">
                      {shareStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-gray-700">
                {getPropertyAttributes(property).map((attribute) => {
                  const Icon = attribute.icon;

                  return (
                    <div key={attribute.label} className="flex min-w-0 items-center gap-2">
                      <Icon className="h-5 w-5 shrink-0 text-[var(--green-dark)]" />
                      <span className="break-words">{attribute.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="premium-panel rounded-2xl border border-[var(--green-dark)]/10 bg-[var(--gray-light)] p-5 md:p-6">
              <h2 className="mb-4 text-2xl font-bold text-[var(--green-dark)]">
                Descrição
              </h2>

              <div className="space-y-5 text-gray-700">
                {descriptionContent.title && (
                  <div className="flex items-start gap-3">
                    <Home className="mt-0.5 h-5 w-5 shrink-0 text-[var(--green-medium)]" />
                    <h3 className="text-base font-bold leading-7 text-gray-900 md:text-lg">
                      {descriptionContent.title}
                    </h3>
                  </div>
                )}

                {descriptionContent.paragraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="max-w-3xl text-base leading-7">
                    {paragraph}
                  </p>
                ))}

                {descriptionContent.highlights.length > 0 && (
                  <ul className="grid gap-x-6 gap-y-3 border-t border-[var(--green-dark)]/10 pt-5 sm:grid-cols-2">
                    {descriptionContent.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 md:text-base">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green-medium)] md:h-5 md:w-5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {nearbyHighlights.length > 0 && (
              <div className="premium-panel rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--green-dark)]" />
                  <h2 className="text-2xl font-bold text-[var(--green-dark)]">
                    Pontos próximos
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {nearbyHighlights.map((item) => {
                    const Icon = getNearbyIcon(item);

                    return (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-xl bg-[var(--gray-light)] px-4 py-3 text-sm font-semibold text-gray-800"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--green-dark)]/10 text-[var(--green-dark)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="break-words">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <PropertyMap property={property} />
          </div>

          {/* SIDEBAR */}
          <div className="lg:order-2 lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="premium-panel hidden rounded-2xl border border-[var(--green-dark)]/15 bg-[#eef3ec] p-5 shadow-sm lg:block">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--green-dark)]/10 px-3 py-1.5 text-sm font-bold text-[var(--green-dark)]">
                    {formatPropertyType(property)}
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-full border border-gray-200 p-2.5 text-gray-600 hover:border-[var(--green-dark)] hover:text-[var(--green-dark)]"
                    aria-label="Compartilhar imóvel"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
                  {property.title}
                </h1>
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <MapPin className="h-4 w-4 text-[var(--green-dark)]" />
                  {property.localArea || property.region}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-gray-700">
                  {getPropertyAttributes(property).slice(0, 3).map((attribute) => {
                    const Icon = attribute.icon;
                    return (
                      <div key={attribute.label} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--green-dark)]" />
                        {attribute.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="premium-price-card rounded-2xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] p-5 text-white md:p-6">

                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
                  Por semana
                </div>

                <div className="mb-4 text-4xl font-bold md:text-5xl">
                  {weeklyPrice}
                </div>

                {/* Availability in sidebar */}
                <div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    isNow
                      ? 'bg-white text-[var(--green-dark)]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {!isNow && <Clock className="h-3.5 w-3.5 shrink-0" />}
                  {availabilityLabel}
                </div>

                <button
                  onClick={() => openLeadForm('whatsapp', 'property_primary')}
                  className="premium-cta flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] py-3.5 font-bold text-black md:py-4"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => openLeadForm('visit', 'property_sidebar')}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                  >
                    <Calendar className="h-5 w-5" />
                    Agendar visita
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="premium-floating-bar fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Por semana
            </div>
            <div className="text-2xl font-bold leading-tight text-[var(--green-dark)]">
              <span className="truncate">{weeklyPrice}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openLeadForm('visit', 'property_mobile_sticky')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[var(--green-dark)] px-3 py-2.5 text-sm font-bold text-[var(--green-dark)]"
          >
            <Calendar className="h-4 w-4" />
            Visita
          </button>

          <button
            onClick={() => openLeadForm('whatsapp', 'property_mobile_primary')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--yellow)] px-3 py-2.5 text-sm font-bold text-black shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </button>
        </div>
      </div>

      <LeadCaptureModal
        isOpen={isLeadFormOpen}
        intent={leadIntent}
        source="property_details"
        property={property}
        onClose={() => setIsLeadFormOpen(false)}
      />

    </div>
  );
}
