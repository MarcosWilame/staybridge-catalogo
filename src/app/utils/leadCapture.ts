import type { Property } from '../data/properties';

export type LeadIntent = 'visit' | 'whatsapp';

export interface LeadDetails {
  name: string;
  moveInDate?: string;
  people?: string;
  note?: string;
}

const intentLabels: Record<LeadIntent, string> = {
  visit: 'agendar uma visita',
  whatsapp: 'falar com a equipe pelo WhatsApp',
};

export function buildLeadMessage(
  intent: LeadIntent,
  details: LeadDetails,
  property?: Pick<Property, 'id' | 'title' | 'region' | 'price'>,
  origin = typeof window !== 'undefined' ? window.location.origin : ''
) {
  const lines = [
    `Olá! Meu nome é ${details.name.trim()}.`,
    `Quero ${intentLabels[intent]}.`,
  ];

  if (property) {
    lines.push(
      '',
      `Imóvel: ${property.title}`,
      `Região: ${property.region}`,
      `Valor: ${property.price}`,
      `ID: ${property.id}`,
      `Link: ${origin}/property/${property.id}`
    );
  }

  if (details.moveInDate) lines.push(`Mudança prevista: ${details.moveInDate}`);
  if (details.people) lines.push(`Número de pessoas: ${details.people}`);
  if (details.note?.trim()) lines.push(`Observação: ${details.note.trim()}`);
  lines.push('', 'Pode me ajudar com os próximos passos?');

  return lines.join('\n');
}

export const leadIntentLabels = intentLabels;
