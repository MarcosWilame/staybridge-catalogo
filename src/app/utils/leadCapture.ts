import type { Property } from '../data/properties';

export type LeadIntent = 'visit' | 'whatsapp';
export type LeadLanguage = 'pt' | 'en';

export interface LeadDetails {
  name: string;
  moveInDate?: string;
  people?: string;
}

const portugueseMoveIn: Record<string, string> = {
  Immediately: 'Imediatamente',
  'This Month': 'Este mês',
  'Next Month': 'Próximo mês',
  'In 2-3 Months': 'Em 2 a 3 meses',
  'Just Researching': 'Apenas pesquisando',
};

const portugueseOccupants: Record<string, string> = {
  '1 Person': '1 pessoa',
  '2 People': '2 pessoas',
  '3+ People': '3 ou mais pessoas',
};

export function buildLeadMessage(
  _intent: LeadIntent,
  details: LeadDetails,
  property?: Pick<Property, 'id' | 'title' | 'region' | 'price'>,
  language: LeadLanguage = 'pt'
) {
  const propertyName = property?.title ?? 'Available properties in London';
  const moveIn = details.moveInDate || '';
  const people = details.people || '';
  const lines = language === 'pt'
    ? [
        'Olá!',
        '',
        'Tenho interesse no seguinte imóvel:',
        '',
        `🏠 ${propertyName}`,
        '',
        `👤 Nome: ${details.name.trim()}`,
        '',
        `📅 Previsão de mudança: ${portugueseMoveIn[moveIn] || moveIn || 'Não informado'}`,
        '',
        `👥 Número de moradores: ${portugueseOccupants[people] || people || 'Não informado'}`,
        '',
        'Gostaria de saber:',
        '',
        '• O imóvel ainda está disponível?',
        '• Quais são os custos para a mudança?',
        '• Poderia me enviar mais fotos ou vídeos?',
        '',
        'Obrigado(a)!',
      ]
    : [
        'Hello!',
        '',
        'I am interested in the following property:',
        '',
        `🏠 ${propertyName}`,
        '',
        `👤 Name: ${details.name.trim()}`,
        '',
        `📅 Expected move-in: ${moveIn || 'Not provided'}`,
        '',
        `👥 Number of occupants: ${people || 'Not provided'}`,
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
