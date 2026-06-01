import { useState, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getGoogleMapsUrl, getPropertyAreaLabel, PropertyMap } from '../components/PropertyMap';
import { getPropertyAttributes } from '../utils/propertyAttributes';
import { getAvailabilityInfo } from '../utils/availability';
import { isFavoriteProperty, toggleFavoriteProperty } from '../utils/favorites';
import { trackPropertyEvent, trackWhatsAppClick } from '../utils/analytics';
import { formatEuroPrice } from '../utils/price';

import {
  ArrowLeft,
  MapPin,
  Bed,
  CheckCircle,
  Heart,
  Calendar,
  Euro,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  TrainFront,
  Trees,
  Beer,
  ShoppingBasket,
  Coffee,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

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

function getNearbyBaseQuery(property: Property) {
  return [getPropertyAreaLabel(property), property.postcode, 'London']
    .filter(Boolean)
    .join(', ');
}

function getNearbySearchUrl(property: Property, search: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(
    `${search} near ${getNearbyBaseQuery(property)}`
  )}`;
}

function getNearbyHighlights(property: Property) {
  const stations = property.nearbyStations?.filter(Boolean) || [];

  return [
    {
      icon: TrainFront,
      title: 'Transporte',
      description: stations.length
        ? `Estações próximas: ${stations.slice(0, 3).join(', ')}.`
        : 'Veja estações e conexões próximas da região.',
      href: getNearbySearchUrl(property, 'tube station train station bus stop'),
    },
    {
      icon: Trees,
      title: 'Parques e praças',
      description: 'Áreas verdes, praças e espaços abertos nas proximidades.',
      href: getNearbySearchUrl(property, 'parks squares green spaces'),
    },
    {
      icon: Beer,
      title: 'Pubs e restaurantes',
      description: 'Opções para sair, comer e conhecer a vida local do bairro.',
      href: getNearbySearchUrl(property, 'pubs restaurants'),
    },
    {
      icon: ShoppingBasket,
      title: 'Mercados',
      description: 'Supermercados e lojas úteis para a rotina do dia a dia.',
      href: getNearbySearchUrl(property, 'supermarkets grocery stores'),
    },
    {
      icon: Coffee,
      title: 'Cafés',
      description: 'Cafeterias e pontos tranquilos para trabalhar ou estudar perto.',
      href: getNearbySearchUrl(property, 'cafes coffee shops'),
    },
  ];
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, isLoading } = useProperties();

  const property = properties.find((p) => p.id === Number(id));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(() =>
    id ? isFavoriteProperty(Number(id)) : false
  );

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setCurrentImageIndex(0);
    setIsFavorite(property?.id ? isFavoriteProperty(property.id) : false);

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [id, property?.id]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isLoading ? 'Carregando propriedade...' : 'Propriedade não encontrada'}
          </h1>

          {!isLoading && (
            <Link
              to="/unidades"
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

  const { label: availabilityLabel, isNow } = getAvailabilityInfo(property.moveInDate);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no ${property.type} em ${property.region} - ${property.title} (ID: ${property.id})`
    );

    trackWhatsAppClick('property_details', {
      property_id: property.id,
      property_title: property.title,
      property_type: property.type,
      property_region: property.region,
    });

    window.open(
      `https://wa.me/5588997993046?text=${message}`,
      '_blank'
    );
  };

  const handleFavoriteClick = () => {
    const nextFavoriteState = toggleFavoriteProperty(property.id);
    setIsFavorite(nextFavoriteState);
    trackPropertyEvent(
      nextFavoriteState ? 'property_favorite_add' : 'property_favorite_remove',
      property,
      { source: 'property_details' }
    );
  };

  const handleMapClick = () => {
    trackPropertyEvent('property_map_click', property, {
      source: 'property_details',
    });
  };

  const mediaItems = getMediaItems(property);
  const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];
  const videoThumbnail = property.image || property.images[0];
  const nearbyHighlights = getNearbyHighlights(property);

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
    <div className="min-h-screen bg-[image:var(--page-gradient)] pb-32 pt-28 md:pb-8">

      {/* BREADCRUMB + BACK */}
      <div className="border-b border-[var(--surface-border)] bg-white/80 py-4 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-[var(--green-dark)] transition-colors">
              Início
            </Link>

            <span>/</span>

            <Link to="/unidades" className="hover:text-[var(--green-dark)] transition-colors">
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
                  src={currentMedia?.src || property.image}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
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
                      src={videoThumbnail}
                      className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <Play className="h-7 w-7 fill-current" />
                    </div>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={item.src}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8">

          {/* MAIN */}
          <div className="space-y-8">

            {/* TITLE */}
            <div className="text-center lg:text-left">
              <div className="mb-4 flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-between">

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
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

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={handleFavoriteClick}
                    className={`rounded-full border-2 p-3 ${
                      isFavorite
                        ? 'bg-red-50 border-red-500 text-red-500'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* INFO */}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-gray-700 lg:justify-start">
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
            <div className="grid overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white/95 shadow-[var(--surface-shadow)] md:grid-cols-2">
              <div className="p-5 md:p-6">
                <h2 className="mb-4 text-2xl font-bold text-[var(--green-dark)]">
                  Descrição
                </h2>

                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.longDescription}
                </p>
              </div>

              <div className="border-t border-[var(--surface-border)] bg-[var(--gray-light)] p-5 md:border-l md:border-t-0 md:p-6">
                <div className="mb-2 text-sm font-bold text-[var(--gray-medium)]">
                  Preço por semana
                </div>
                <div className="mb-4 flex items-start text-4xl font-extrabold text-[var(--green-dark)] md:text-5xl">
                  <Euro className="mt-1 h-7 w-7 md:h-8 md:w-8" />
                  {formatEuroPrice(property.price).replace(/^€/, '')}
                </div>
                <div
                  className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    isNow
                      ? 'bg-[var(--yellow)] text-black'
                      : 'bg-[var(--green-dark)]/10 text-[var(--green-dark)]'
                  }`}
                >
                  {!isNow && <Clock className="h-3.5 w-3.5 shrink-0" />}
                  {availabilityLabel}
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--whatsapp)] py-3.5 font-bold text-[var(--whatsapp-foreground)] transition-colors hover:bg-[var(--whatsapp-hover)] md:py-4"
                >
                  <WhatsAppIcon className="w-6 h-6" />
                  Falar no WhatsApp
                </button>
                <a
                  href={getGoogleMapsUrl(property)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleMapClick}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--surface-border)] bg-white py-3.5 font-bold text-[var(--green-dark)] transition-colors hover:bg-[var(--gray-light)] md:py-4"
                >
                  <MapPin className="w-6 h-6" />
                  Abrir endereço no mapa
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--surface-border)] bg-white/95 p-5 shadow-[var(--surface-shadow)] md:p-6">
              <div className="mx-auto mb-6 max-w-4xl text-center">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--green-dark)]">
                    Locais aproximados
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Buscas rápidas no mapa para entender melhor a rotina ao redor da locação.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {nearbyHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-lg border border-[var(--surface-border)] bg-[var(--gray-light)] p-4 text-left transition-all hover:border-[var(--green-dark)] hover:bg-white hover:shadow-[var(--surface-shadow)]"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[var(--green-medium)] transition-colors group-hover:bg-[var(--green-medium)] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </span>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-flex text-sm font-bold text-[var(--green-medium)]">
                        Ver no mapa
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            <section>
              <div className="mb-4 text-center">
                <span className="inline-flex rounded-full bg-[var(--yellow)] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-black">
                  localização da unidade
                </span>
                <h2 className="mt-3 text-2xl font-extrabold text-[var(--green-dark)] md:text-3xl">
                  Veja a região no mapa
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
                  A marcação mostra a área aproximada para você entender melhor o entorno.
                </p>
              </div>
              <PropertyMap
                property={property}
                className="mx-auto shadow-2xl"
                mapHeightClassName="h-[360px] md:h-[500px]"
              />
            </section>

          </div>

        </div>
      </div>

    </div>
  );
}
