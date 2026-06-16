import { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getGoogleMapsUrl, PropertyMap } from '../components/PropertyMap';
import { getPropertyAttributes } from '../utils/propertyAttributes';
import { getAvailabilityInfo } from '../utils/availability';
import { getOptimizedImageUrl, preloadImage } from '../utils/cloudinary';
import { WHATSAPP_URL } from '../config/contact';
import { SEO } from '../components/SEO';
import { getAbsoluteUrl, SITE_NAME } from '../config/site';
import { trackEvent } from '../utils/analytics';

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
import { createWhatsAppLeadMessage, shareProperty } from '../utils/shareProperty';

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
    ? getAvailabilityInfo(property.moveInDate)
    : { label: '', isNow: false };
  const weeklyPrice = property ? formatWeeklyPrice(property.price) : '';
  const nearbyHighlights = property
    ? property.nearbyStations.filter((item) => item.trim().length > 0)
    : [];

  const handleWhatsApp = () => {
    if (!property) return;

    const message = encodeURIComponent(createWhatsAppLeadMessage(property));

    trackEvent('whatsapp_click', {
      source: 'property_details',
      property_id: property.id,
      property_type: property.type,
      property_category: property.category,
      region: property.region,
      local_area: property.localArea,
      postcode: property.postcode,
      weekly_price: getPriceValue(property.price),
      availability: availabilityLabel,
      available_now: isNow,
      bills_included: property.billsIncluded,
    });

    window.open(
      `${WHATSAPP_URL}?text=${message}`,
      '_blank'
    );
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
    `${property.type} em ${property.region} com atendimento em portugues.`;
  const propertyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: property.title,
    description: propertyDescription,
    image: (property.images?.length ? property.images : [property.image]).filter(Boolean),
    url: getAbsoluteUrl(`/property/${property.id}`),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.localArea || property.region,
      postalCode: property.postcode,
      streetAddress: property.address,
      addressCountry: 'GB',
    },
    amenityFeature: property.amenities.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    offers: {
      '@type': 'Offer',
      price: getPriceValue(property.price),
      priceCurrency: 'GBP',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: getPriceValue(property.price),
        priceCurrency: 'GBP',
        unitText: 'week',
      },
      availability: property.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: getAbsoluteUrl(`/property/${property.id}`),
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
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
    <div className="min-h-screen bg-white pb-44 pt-20 md:pb-8">
      <SEO
        title={`${property.title} em ${property.region}`}
        description={`${propertyDescription} Valor ${weeklyPrice}. ${availabilityLabel}.`}
        image={property.image}
        type="article"
        jsonLd={[propertyJsonLd, breadcrumbJsonLd]}
      />

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
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* IMAGE GALLERY */}
        <div className="mb-6 md:mb-8">
          <div className="relative mb-4 overflow-hidden rounded-xl shadow-xl md:rounded-2xl md:shadow-2xl">

            <div className="relative h-72 sm:h-96 md:h-[600px]">
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
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
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
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 md:left-4 md:p-3"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={nextImage}
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
                {property.available && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold md:px-4 md:py-2 md:text-sm ${
                      isNow
                        ? 'bg-[var(--yellow)] text-black'
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
                )}

                {property.billsIncluded && (
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[var(--green-dark)] md:px-4 md:py-2 md:text-sm">
                    Bills Inclusas
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
                onClick={() => setCurrentImageIndex(index)}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN */}
          <div className="lg:col-span-2 space-y-8">

            {/* TITLE */}
            <div>
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="max-w-full rounded-full bg-[var(--green-dark)] px-3 py-1.5 text-sm font-bold leading-snug text-white">
                      {property.type}
                    </span>

                    <span className="flex min-w-0 items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="break-words">{property.region}</span>
                    </span>

                    {/* Availability inline badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                        isNow
                          ? 'bg-[var(--yellow)] text-black'
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
            <div className="rounded-2xl bg-[var(--gray-light)] p-5 md:p-6">
              <h2 className="mb-4 text-2xl font-bold text-[var(--green-dark)]">
                Descrição
              </h2>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.longDescription}
              </p>
            </div>

            {nearbyHighlights.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
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
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="rounded-2xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] p-5 text-white md:p-6">

                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
                  Week
                </div>

                <div className="mb-4 text-4xl font-bold md:text-5xl">
                  {weeklyPrice}
                </div>

                {/* Availability in sidebar */}
                <div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    isNow
                      ? 'bg-[var(--yellow)] text-black'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {!isNow && <Clock className="h-3.5 w-3.5 shrink-0" />}
                  {availabilityLabel}
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] py-3.5 font-bold text-black md:py-4"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar no WhatsApp
                </button>

                <a
                  href={getGoogleMapsUrl(property)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    trackEvent('map_open_click', {
                      source: 'property_details',
                      property_id: property.id,
                    })
                  }
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 py-3.5 font-bold text-[var(--green-dark)] md:py-4"
                >
                  <MapPin className="w-6 h-6" />
                  Abrir endereço no mapa
                </a>

              </div>

            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Week
            </div>
            <div className="text-2xl font-bold leading-tight text-[var(--green-dark)]">
              <span className="truncate">{weeklyPrice}</span>
            </div>
          </div>

          <button
            onClick={handleWhatsApp}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-5 py-3 font-bold text-black shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </button>
        </div>
      </div>

    </div>
  );
}
