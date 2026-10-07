import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react';
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
import {
  getDesktopGalleryLayout,
  type GalleryMediaItem,
} from '../utils/propertyGallery';

import {
  ArrowLeft,
  MapPin,
  Bed,
  MessageCircle,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  CreditCard,
  Users,
  Maximize2,
  X,
  Bus,
  ShoppingBasket,
  Pill,
  TrainFront,
  ImageOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { shareProperty } from '../utils/shareProperty';

interface PropertyAttribute {
  icon: LucideIcon;
  label: string;
}

type MediaItem = GalleryMediaItem;

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

function isDirectVideoUrl(url: string) {
  return /\.(?:mp4|webm|mov)(?:[?#].*)?$/i.test(url);
}

function getMediaItems(property: Property): MediaItem[] {
  const imageItems = (property.images?.length ? property.images : [property.image])
    .filter(Boolean)
    .map((src) => ({ type: 'image' as const, src }));

  if (!property.video) return imageItems;

  const videoItem = {
    type: 'video' as const,
    src: property.video,
    embedSrc: getVideoEmbedUrl(property.video),
  };

  return property.coverMedia === 'video'
    ? [videoItem, ...imageItems]
    : [...imageItems, videoItem];
}

function formatWeeklyPrice(price: string | number) {
  const cleanedPrice = String(price ?? '').trim();
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

function getNearbyPresentation(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes('bus')) {
    return { icon: Bus, category: 'Transporte' };
  }
  if (normalized.includes('station') || normalized.includes('junction') || normalized.includes('tube')) {
    return { icon: TrainFront, category: 'Estação' };
  }
  if (normalized.includes('market') || normalized.includes('supermarket') || normalized.includes('sainsbury')) {
    return { icon: ShoppingBasket, category: 'Mercado' };
  }
  if (normalized.includes('pharmacy') || normalized.includes('farmácia')) {
    return { icon: Pill, category: 'Serviço' };
  }

  return { icon: MapPin, category: 'Perto daqui' };
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);
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
    ? getAvailabilityInfo(property.moveInDate, property.available, new Date(), property.availabilityStatus)
    : { label: '', isNow: false };
  const weeklyPrice = property ? formatWeeklyPrice(property.priceOptions?.find((option) => option.period === 'week')?.amount ?? property.price) : '';
  const availabilityDisplay = 'Consulte a disponibilidade';
  const nearbyPoints = property
    ? property.nearbyStations.filter((point) => point.trim().length > 0)
    : [];
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

  useEffect(() => {
    if (!isLightboxOpen) {
      lightboxTriggerRef.current?.focus();
      lightboxTriggerRef.current = null;
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowRight') nextImage();
      if (event.key === 'ArrowLeft') prevImage();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    const frame = window.requestAnimationFrame(() => lightboxCloseRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, mediaItems.length]);

  if (!property) return propertyNotFoundContent;

  const propertyDescription =
    property.description ||
    `${formatPropertyType(property)} em ${property.region} com suporte especializado.`;
  const propertyUrl = getAbsoluteUrl(`/property/${property.id}`);
  const residenceId = `${propertyUrl}#residence`;
  const listingId = `${propertyUrl}#listing`;
  const isApartment = ['flat', 'studio', 'apartment'].includes(
    property.category.toLowerCase()
  );
  const propertyImages = Array.from(
    new Set([property.image, ...(property.images || [])].filter(Boolean))
  );
  const desktopGalleryLayout = getDesktopGalleryLayout(mediaItems);
  const desktopMediaItems = desktopGalleryLayout.secondaryItems;
  const desktopMediaCount = desktopMediaItems.length;
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

  const openLightboxAt = (index: number, trigger?: HTMLElement) => {
    if (!mediaItems.length) return;
    const activeElement = document.activeElement;
    lightboxTriggerRef.current = trigger ?? (
      activeElement instanceof HTMLElement ? activeElement : null
    );
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="premium-page min-h-screen bg-[#f5f6f1] pb-28 pt-20 md:pb-8">
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
      <div className="border-b border-black/5 bg-white/80 py-4 backdrop-blur">
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
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* IMAGE GALLERY */}
        <div className="mb-8">
          <div className="premium-media relative overflow-hidden rounded-[28px] border border-black/5 bg-[#e8ebe5] shadow-[0_20px_60px_rgba(20,55,35,.14)]">
            {mediaItems.length === 0 ? (
              <div
                className="flex min-h-[18rem] items-center justify-center px-6 py-16 text-center sm:min-h-[26rem]"
                role="status"
                aria-live="polite"
              >
                <div className="max-w-sm">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--green-dark)] shadow-sm">
                    <ImageOff className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-[var(--green-dark)]">
                    Fotos indisponíveis no momento
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Ainda não temos imagens desta acomodação. Fale com um agente para receber mais detalhes e confirmar a visita.
                  </p>
                </div>
              </div>
            ) : (
              <>
            <div className={`relative hidden min-h-0 gap-2 lg:grid lg:h-[clamp(28rem,40vw,36rem)] ${desktopGalleryLayout.rootClassName}`}>
              <button
                type="button"
                onClick={(event) => openLightboxAt(currentImageIndex, event.currentTarget)}
                className="group relative h-full min-h-0 overflow-hidden bg-[#dfe6df] text-left"
                aria-label="Abrir galeria de fotos"
              >
                {currentMedia?.type === 'video' ? (
                  isDirectVideoUrl(currentMedia.src) ? (
                    <video src={currentMedia.src} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <ImageWithFallback src={getOptimizedImageUrl(videoThumbnail, 'detail')} alt="Vídeo do imóvel" className="h-full w-full object-cover" />
                  )
                ) : (
                  <ImageWithFallback
                    src={getOptimizedImageUrl(currentMedia?.src || property.image, 'detail')}
                    alt={getPropertyImageAlt(property, currentImageIndex)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
                <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-gray-900 shadow-lg">
                  <Maximize2 className="h-4 w-4" />
                  Ver galeria
                </span>
                <span className="absolute bottom-5 right-5 rounded-full bg-black/65 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                  {currentImageIndex + 1} / {mediaItems.length}
                </span>
              </button>

              {desktopMediaItems.length > 0 && (
                <div className={`grid h-full min-h-0 auto-rows-fr gap-2 ${desktopGalleryLayout.secondaryClassName}`}>
                {desktopMediaItems.map((item, index) => {
                  const mediaIndex = index + 1;
                  return (
                    <button
                      key={`${mediaIndex}-${item.src}`}
                      type="button"
                      onClick={(event) => openLightboxAt(mediaIndex, event.currentTarget)}
                      className={`group relative min-h-0 overflow-hidden bg-[#dfe6df] text-left ${
                        desktopMediaCount === 3 && index === 2 ? 'col-span-2' : ''
                      }`}
                      aria-label={`Ver imagem ${mediaIndex + 1}`}
                    >
                      {item.type === 'video' ? (
                        <div className="relative h-full w-full bg-black">
                          <ImageWithFallback src={getOptimizedImageUrl(videoThumbnail, 'detail')} alt="Vídeo do imóvel" className="h-full w-full object-cover opacity-75" />
                          <Play className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 fill-white text-white" />
                        </div>
                      ) : (
                        <ImageWithFallback src={getOptimizedImageUrl(item.src, 'detail')} alt={getPropertyImageAlt(property, mediaIndex)} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" loading="lazy" />
                      )}
                      {mediaIndex === 4 && mediaItems.length > 5 && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">
                          +{mediaItems.length - 5} fotos
                        </span>
                      )}
                    </button>
                  );
                })}
                </div>
              )}
            </div>

            <div className="relative aspect-[4/3] min-h-[18rem] sm:min-h-[26rem] lg:hidden">
              {currentMedia?.type === 'video' ? (
                isDirectVideoUrl(currentMedia.src) ? (
                  <video
                    src={currentMedia.src}
                    title={`${property.title} - Video`}
                    className="h-full w-full bg-black object-contain"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <iframe
                    src={currentMedia.embedSrc}
                    title={`${property.title} - Video`}
                    className="h-full w-full border-0 bg-black"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                )
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
                  <>
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    {availabilityDisplay}
                  </>
                </span>

                {currentMedia?.type === 'image' && isIllustrativePropertyImage(currentMedia.src) && (
                  <span className="w-fit rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                    Imagem ilustrativa
                  </span>
                )}

              </div>
            </div>
            </>
            )}
          </div>

          {/* MOBILE THUMBNAILS */}
          {mediaItems.length > 0 && <div className="mt-3 grid grid-cols-5 gap-2 lg:hidden">
            {mediaItems.slice(0, 8).map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={(event) => openLightboxAt(index, event.currentTarget)}
                aria-label={item.type === 'video' ? `Reproduzir vídeo de ${property.title}` : `Ver ${getPropertyImageAlt(property, index)}`}
                aria-current={currentImageIndex === index ? 'true' : undefined}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
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
          </div>}

          {mediaItems.length > 0 && <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
            <span className="text-xs font-semibold text-gray-500">Deslize para ver todos os ambientes</span>
            <button type="button" onClick={(event) => openLightboxAt(currentImageIndex, event.currentTarget)} className="inline-flex items-center gap-2 rounded-full border border-[var(--green-dark)]/20 bg-white px-3 py-2 text-xs font-bold text-[var(--green-dark)]">
              <Maximize2 className="h-3.5 w-3.5" />
              Ver todas
            </button>
          </div>}

        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* MAIN */}
          <div className="space-y-8 lg:col-span-2">

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

            {/* QUICK FACTS */}
            <div className="border-y border-[var(--green-dark)]/15 bg-[#fafbf7] px-2 py-4 md:px-0 md:py-5">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  {
                    icon: Bed,
                    value: property.bedrooms ? String(property.bedrooms) : '—',
                    label: 'quarto(s)',
                  },
                  {
                    icon: Users,
                    value: property.people ? `Até ${property.people}` : 'Consulte',
                    label: 'moradores',
                  },
                  { icon: CreditCard, value: 'A confirmar', label: 'bills' },
                  {
                    icon: Calendar,
                    value: 'Consulte a disponibilidade',
                    label: 'com um de nossos agentes',
                  },
                ].map(({ icon: Icon, value, label }, index) => (
                  <div
                    key={label}
                    className={`flex min-h-[68px] items-center gap-3 px-4 py-3 ${
                      index > 0 ? 'border-t border-[var(--green-dark)]/15 md:border-l md:border-t-0' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[var(--green-medium)]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-5 text-gray-900">{value}</p>
                      <p className="text-xs leading-4 text-gray-500">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {property.amenities.length > 0 && (
              <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
                <div className="mb-3 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--green-medium)]">
                  O que você encontra
                </div>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.slice(0, 8).map((amenity) => (
                    <span key={amenity} className="rounded-full bg-[#eef4ed] px-3 py-1.5 text-sm font-semibold text-[var(--green-dark)]">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {nearbyPoints.length > 0 && (
              <section className="border-t border-[var(--green-dark)]/15 pt-7">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--green-medium)]">
                      A região ao redor
                    </p>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--green-dark)]">
                      Pontos próximos
                    </h2>
                  </div>
                  <MapPin className="h-6 w-6 shrink-0 text-[var(--green-medium)]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {nearbyPoints.map((point) => {
                    const { icon: Icon, category } = getNearbyPresentation(point);

                    return (
                      <div
                        key={point}
                        className="group flex min-h-[84px] items-center gap-3 rounded-2xl border border-[#dfe8df] bg-[#f8faf6] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[var(--green-medium)]/45 hover:bg-white hover:shadow-sm"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4f0e5] text-[var(--green-dark)] transition group-hover:bg-[var(--green-dark)] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-[.12em] text-[var(--green-medium)]">
                            {category}
                          </span>
                          <span className="mt-1 block break-words text-sm font-bold leading-5 text-gray-900">
                            {point}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {(property.description || property.longDescription) && (
              <section className="border-t border-[var(--green-dark)]/15 pt-7">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[var(--green-medium)]">
                  Sobre este espaço
                </p>
                <p className="max-w-3xl text-[1.05rem] leading-8 text-gray-700">
                  {property.description || property.longDescription}
                </p>
              </section>
            )}

            <PropertyMap property={property} />
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              <div className="premium-panel hidden rounded-3xl border border-black/5 bg-white p-6 shadow-[0_15px_45px_rgba(20,55,35,.08)] lg:block">
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

              <div className="premium-price-card rounded-3xl bg-gradient-to-br from-[#123d27] via-[var(--green-dark)] to-[var(--green-medium)] p-6 text-white shadow-[0_18px_45px_rgba(18,61,39,.25)] md:p-7">

                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/80">
                  Por semana
                </div>

                <div className="mb-4 text-4xl font-bold md:text-5xl">
                  {weeklyPrice}
                </div>

                {property.monthlyPrice && (
                  <div className="mb-4 text-sm font-semibold text-white/80">
                    {property.monthlyPrice}
                  </div>
                )}

                <div className="mb-5 grid grid-cols-2 gap-3 border-y border-white/15 py-4 text-sm">
                  <div>
                    <div className="text-white/65">Depósito</div>
                    <div className="mt-1 font-bold">{property.deposit ? `£${property.deposit}` : 'A confirmar'}</div>
                  </div>
                  <div>
                    <div className="text-white/65">Bills</div>
                    <div className="mt-1 font-bold">A confirmar</div>
                  </div>
                </div>

                <div className="mb-5 flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
                  <div>
                    <div className="font-bold">Para entrar</div>
                    <div className="mt-1 text-white/75">{property.entryRent || 'Confirme o aluguel inicial com a equipe.'}</div>
                  </div>
                </div>

                {/* Availability in sidebar */}
                <div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    isNow
                      ? 'bg-white text-[var(--green-dark)]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {availabilityDisplay}
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

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#061a12]/95 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos do imóvel"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            ref={lightboxCloseRef}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="Fechar galeria"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center">
            <div className="relative flex min-h-0 flex-1 items-center justify-center self-stretch">
              {currentMedia?.type === 'video' ? (
                isDirectVideoUrl(currentMedia.src) ? (
                  <video src={currentMedia.src} title={`${property.title} - Video`} className="max-h-[78vh] max-w-full rounded-2xl bg-black object-contain" controls playsInline />
                ) : (
                  <iframe src={currentMedia.embedSrc} title={`${property.title} - Video`} className="h-[70vh] w-full max-w-4xl rounded-2xl border-0 bg-black" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                )
              ) : (
                <ImageWithFallback src={getOptimizedImageUrl(currentMedia?.src || property.image, 'detail')} alt={getPropertyImageAlt(property, currentImageIndex)} className="max-h-[78vh] max-w-full rounded-2xl object-contain" />
              )}

              {mediaItems.length > 1 && (
                <>
                  <button type="button" onClick={prevImage} className="absolute left-2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-4" aria-label="Imagem anterior">
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button type="button" onClick={nextImage} className="absolute right-2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-4" aria-label="Próxima imagem">
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 py-4 text-sm font-bold text-white/80">
              <span>{currentImageIndex + 1} / {mediaItems.length}</span>
              <span className="text-white/35">•</span>
              <span className="truncate">{property.title}</span>
            </div>
          </div>
        </div>
      )}

      <div className="premium-floating-bar fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.12)] backdrop-blur md:hidden">
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
