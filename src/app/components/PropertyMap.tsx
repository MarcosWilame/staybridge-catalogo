import { ExternalLink, MapPin } from 'lucide-react';
import { Property } from '../data/properties';

interface PropertyMapProps {
  property?: Property;
  properties?: Property[];
  onSelectProperty?: (property: Property) => void;
  className?: string;
  mapHeightClassName?: string;
}

function getAreaLabel(property?: Property) {
  if (!property) return 'London';

  if (property.localArea) return property.localArea;

  const descriptionArea = property.description?.match(/\bem\s+([^.,]+)/i)?.[1]?.trim();
  if (descriptionArea) return descriptionArea;

  const station = property.nearbyStations?.find(Boolean);
  if (station) return station.replace(/\s+Station$/i, '').trim();

  const titleArea = property.title?.match(/\s-\s([A-Za-z][A-Za-z\s]+)$/)?.[1]?.trim();
  if (titleArea) return titleArea;

  const region = property.region || '';
  if (!/^(north|south|east|west|central)\s+london$/i.test(region)) {
    return region;
  }

  return property.postcode || region || 'London';
}

export function getPropertyAreaLabel(property?: Property) {
  return getAreaLabel(property);
}

export function getMapQuery(property?: Property) {
  if (!property) return 'London';

  return [getAreaLabel(property), 'London']
    .filter(Boolean)
    .join(', ');
}

export function getGoogleMapsUrl(property?: Property) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    getMapQuery(property)
  )}`;
}

export function PropertyMap({
  property,
  properties = [],
  onSelectProperty,
  className = '',
  mapHeightClassName = 'h-64 md:h-80',
}: PropertyMapProps) {
  const selectedProperty = property || properties[0];
  const areaLabel = getAreaLabel(selectedProperty);
  const mapQuery = getMapQuery(selectedProperty);
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&z=13&output=embed`;

  return (
    <div className={`overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-lg md:rounded-2xl ${className}`}>
      <div className="border-b border-emerald-100 bg-white/90 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[var(--green-dark)] font-bold">
              <MapPin className="w-5 h-5" />
              Localização
            </div>
            {selectedProperty && (
              <p className="mt-1 break-words text-sm text-gray-600">
                Área aproximada: {areaLabel}
              </p>
            )}
          </div>

          <a
            href={getGoogleMapsUrl(selectedProperty)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--green-dark)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--green-medium)]"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir
          </a>
        </div>
      </div>

      <div className={`relative ${mapHeightClassName}`}>
        <iframe
          title={`Mapa - ${selectedProperty?.title || 'Bedminster'}`}
          src={mapUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full border-4 border-[var(--yellow)] bg-[var(--yellow)]/20 shadow-[0_0_0_999px_rgba(0,0,0,0.08)] md:h-40 md:w-40" />
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--green-dark)] shadow">
          Raio aproximado da área
        </div>
      </div>

      {properties.length > 1 && (
        <div className="max-h-56 overflow-auto border-t border-gray-100">
          {properties.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectProperty?.(item)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                selectedProperty?.id === item.id
                  ? 'bg-[var(--green-dark)]/10 text-[var(--green-dark)] font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <div>{item.title}</div>
              <div className="text-xs text-gray-500">
                {getAreaLabel(item)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
