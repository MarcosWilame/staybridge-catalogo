import type { Property } from '../data/properties';

export type LeadIntent = 'visit' | 'whatsapp';

export interface LeadDetails {
  name: string;
  moveInDate?: string;
  people?: string;
}

export function buildLeadMessage(
  _intent: LeadIntent,
  details: LeadDetails,
  property?: Pick<Property, 'id' | 'title' | 'region' | 'price'>,
  _origin = typeof window !== 'undefined' ? window.location.origin : ''
) {
  const propertyName = property?.title ?? 'Available properties in London';
  const lines = [
    'Hello!',
    '',
    'I am interested in the following property:',
    '',
    `🏠 ${propertyName}`,
    '',
    `👤 Name: ${details.name.trim()}`,
    '',
    `📅 Expected move-in: ${details.moveInDate || 'Not provided'}`,
    '',
    `👥 Number of occupants: ${details.people || 'Not provided'}`,
    '',
    'I would like to know:',
    '',
    '• Is the property still available?',
    '• What are the move-in costs?',
    '• Could you send me more photos or videos?',
    '',
    'Thank you!',
  ];

  return lines.join('\n');
}
