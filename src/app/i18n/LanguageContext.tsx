import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type SiteLanguage = 'pt' | 'en';

interface LanguageContextValue {
  language: SiteLanguage;
  setLanguage: (language: SiteLanguage) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
}

const STORAGE_KEY = 'staybridge-language';

const LanguageContext = createContext<LanguageContextValue | null>(null);

const textTranslations: Record<string, string> = {
  'Pular para o conteúdo principal': 'Skip to main content',
  'Staybridge London — início': 'Staybridge London — home',
  'Navegação principal': 'Main navigation',
  'Navegação mobile': 'Mobile navigation',
  'Início': 'Home',
  Inicio: 'Home',
  Unidades: 'Properties',
  Benefícios: 'Benefits',
  'Buscar imóveis': 'Search properties',
  'Fechar menu': 'Close menu',
  'Abrir menu': 'Open menu',
  'Acomodação em Londres • Atendimento em português': 'Accommodation in London • Support in Portuguese',
  'Encontre sua acomodação': 'Find your accommodation',
  'em Londres.': 'in London.',
  'em Londres': 'in London',
  'Encontre sua acomodação em Londres.': 'Find your accommodation in London.',
  'Busque por região, estação ou postcode e veja opções disponíveis com preço claro e atendimento em português.':
    'Search by area, station, or postcode and see available options with clear pricing and Portuguese-speaking support.',
  'Buscar acomodação': 'Search accommodation',
  'Região, estação ou postcode': 'Area, station, or postcode',
  'Buscas rápidas': 'Quick searches',
  'Imóveis a partir de £160 por semana': 'Properties from £160 per week',
  'Bills inclusas': 'Bills included',
  'Entrada imediata': 'Immediate move-in',
  'Valores semanais claros': 'Clear weekly prices',
  'Disponibilidade atualizada': 'Updated availability',
  'Suporte em português': 'Portuguese-speaking support',
  'Resumo de disponibilidade': 'Availability summary',
  'Catálogo ativo agora': 'Live catalogue now',
  'opções disponíveis': 'available options',
  'imóveis alugados em Londres': 'properties rented in London',
  'anos de experiência no mercado': 'years of market experience',
  'Estrutura local': 'Local structure',
  'operação profissional em Londres': 'professional operation in London',
  'Em português': 'In Portuguese',
  'suporte humano até a mudança': 'human support until move-in',
  'tipos de acomodação': 'accommodation types',
  'Decisão clara': 'Clear decision',
  'fotos, preço e detalhes': 'photos, price, and details',
  'Conectando brasileiros às melhores acomodações em Londres. Atendimento especializado e suporte em português.':
    'Connecting Brazilians with the best accommodation in London. Specialist support in Portuguese.',
  'Links Rápidos': 'Quick Links',
  'Ver Unidades': 'View Properties',
  'Perguntas frequentes': 'FAQ',
  Contato: 'Contact',
  'Londres, Reino Unido': 'London, United Kingdom',
  'Explorar imóveis': 'Explore properties',
  '© 2026 Staybridge London. Todos os direitos reservados.':
    '© 2026 Staybridge London. All rights reserved.',
  'Preferências de cookies': 'Cookie preferences',
  'Usamos cookies de análise para entender o uso do site e melhorar sua experiência.':
    'We use analytics cookies to understand site usage and improve your experience.',
  Recusar: 'Decline',
  Aceitar: 'Accept',
  Buscar: 'Search',
  'Preparando as chaves das unidades': 'Preparing the keys to the properties',
  'Estamos buscando os imoveis disponiveis e montando a vitrine.':
    'We are fetching available properties and preparing the catalogue.',
  'Confirmando disponibilidade': 'Confirming availability',
  Resultados: 'Results',
  Filtros: 'Filters',
  'Abrir filtros': 'Open filters',
  'Fechar filtros': 'Close filters',
  'Ordenar propriedades': 'Sort properties',
  'Ordenar por': 'Sort by',
  Recomendados: 'Recommended',
  'Menor preço': 'Lowest price',
  'Maior preço': 'Highest price',
  'Disponível agora': 'Available now',
  Tipo: 'Type',
  Todas: 'All',
  Todos: 'All',
  'Limpar filtros': 'Clear filters',
  Limpar: 'Clear',
  'Ajuda para escolher': 'Help me choose',
  'Ver mais propriedades': 'View more properties',
  'Nenhuma propriedade encontrada': 'No properties found',
  'Ajuste os filtros ou fale conosco para encontrar uma opção ideal.':
    'Adjust the filters or talk to us to find the right option.',
  'Falar no WhatsApp': 'Chat on WhatsApp',
  'Não encontrou o ideal?': 'Did not find the right one?',
  'Receba ajuda em português': 'Get help in Portuguese',
  'Quero ajuda': 'I want help',
  Comparar: 'Compare',
  'Remover da comparacao': 'Remove from comparison',
  'Adicionar a comparacao': 'Add to comparison',
  'Melhor valor': 'Best value',
  Imovel: 'Property',
  Imóveis: 'Properties',
  'Imagem ilustrativa': 'Illustrative image',
  'Imagem anterior': 'Previous image',
  'Próxima imagem': 'Next image',
  'Compartilhar imovel': 'Share property',
  'Compartilhar imóvel': 'Share property',
  Compartilhar: 'Share',
  Compartilhado: 'Shared',
  'Link copiado': 'Link copied',
  'Nao foi possivel compartilhar': 'Could not share',
  'Por semana': 'Per week',
  'Ver Detalhes': 'View Details',
  Descrição: 'Description',
  'Pontos próximos': 'Nearby places',
  'Voltar': 'Back',
  'Voltar para Propriedades': 'Back to Properties',
  'Imóvel não encontrado': 'Property not found',
  'Propriedade não encontrada': 'Property not found',
  'Carregando propriedade...': 'Loading property...',
  'Ver imagem anterior do imóvel': 'View previous property image',
  'Ver próxima imagem do imóvel': 'View next property image',
  'Agendar visita': 'Schedule a viewing',
  Visita: 'Viewing',
  'Acomodações para brasileiros em Londres': 'Accommodation for Brazilians in London',
  'Imóveis e quartos em Londres': 'Properties and rooms in London',
  'Acomodações disponíveis agora em Londres': 'Accommodation available now in London',
  'Imóveis e quartos para alugar em Londres': 'Properties and rooms to rent in London',
  'Sincronizando propriedades...': 'Syncing properties...',
  'Buscando unidades...': 'Searching properties...',
  'Ate £': 'Up to £',
  'Mudança até': 'Move-in by',
  'pessoas': 'people',
  'pessoa': 'person',
  capacidade: 'capacity',
  busca: 'search',
  regiao: 'area',
  valor: 'price',
  'data de mudança': 'move-in date',
  Inclusas: 'Included',
  Consultar: 'Ask',
  Entrada: 'Move-in',
  Capacidade: 'Capacity',
  Local: 'Location',
  Preco: 'Price',
  Preço: 'Price',
  'Ajuste as preferências': 'Adjust preferences',
  'Ver imóveis compatíveis': 'View matching properties',
  'Match de acomodação': 'Accommodation match',
  'Conte o que procura.': 'Tell us what you are looking for.',
  'Escolha três preferências e veja quantos imóveis combinam com você.':
    'Choose three preferences and see how many properties match you.',
  '3 escolhas rápidas': '3 quick choices',
  'Seu resultado aparece aqui': 'Your result appears here',
  'Seu resultado': 'Your result',
  'Calculando…': 'Calculating...',
  'Nenhum match com esses filtros.': 'No matches with these filters.',
  'Qual é o orçamento semanal?': 'What is your weekly budget?',
  'Até £200': 'Up to £200',
  '£200–£300': '£200-£300',
  Flexível: 'Flexible',
  'Em qual região?': 'Which area?',
  'Toda Londres': 'All London',
  'Selecione uma região': 'Select an area',
  'Até quando pretende mudar?': 'When do you plan to move?',
  'Encontramos': 'We found',
  'para você.': 'for you.',
  opção: 'option',
  opções: 'options',
  'Começar minha busca': 'Start my search',
  'Seleção disponível agora': 'Available selection now',
  'Disponíveis agora em Londres': 'Available now in London',
  'Compare fotos, valores semanais e localização antes de falar com a equipe.':
    'Compare photos, weekly prices, and location before speaking with the team.',
  'Ver mais imóveis': 'View more properties',
  'Deslize para comparar mais opções': 'Swipe to compare more options',
  'Simples, claro e humano': 'Simple, clear, and human',
  'Da busca à mudança, você não está sozinho.':
    'From search to move-in, you are not alone.',
  'Uma jornada objetiva para encontrar, confirmar e reservar sua acomodação em Londres.':
    'A straightforward journey to find, confirm, and book your accommodation in London.',
  'Atendimento em português': 'Portuguese-speaking support',
  'Preço e detalhes transparentes': 'Transparent price and details',
  'Orientação até a mudança': 'Guidance until move-in',
  'PASSO': 'STEP',
  Encontre: 'Find',
  'Busque por região, estação ou postcode.': 'Search by area, station, or postcode.',
  Converse: 'Talk',
  'Confirme disponibilidade e tire suas dúvidas.':
    'Confirm availability and ask your questions.',
  Mude: 'Move',
  'Organize sua entrada com suporte da equipe.':
    'Arrange your move-in with team support.',
  'Open WhatsApp in Portuguese': 'Open WhatsApp in Portuguese',
  'Open WhatsApp in English': 'Open WhatsApp in English',
  'Find your home in London': 'Find your home in London',
  'Receive availability and more information via WhatsApp.':
    'Receive availability and more information via WhatsApp.',
  'Full Name': 'Full Name',
  'How should we call you?': 'How should we call you?',
  'Expected Move-In': 'Expected Move-In',
  Optional: 'Optional',
  'Number of Occupants': 'Number of Occupants',
  'WhatsApp Message Language': 'WhatsApp Message Language',
  Português: 'Portuguese',
  English: 'English',
  'Your message opens in WhatsApp for review. Nothing is sent automatically or stored on this site.':
    'Your message opens in WhatsApp for review. Nothing is sent automatically or stored on this site.',
};

const phraseTranslations: Array<[RegExp, string]> = [
  [/\bacomodações\b/gi, 'accommodations'],
  [/\bacomodação\b/gi, 'accommodation'],
  [/\bencontre sua\b/gi, 'find your'],
  [/\bsua\b/gi, 'your'],
  [/\bseu\b/gi, 'your'],
  [/\bvocê\b/gi, 'you'],
  [/\bpara você\b/gi, 'for you'],
  [/\bem londres\b/gi, 'in London'],
  [/\bem português\b/gi, 'in Portuguese'],
  [/\bportuguês\b/gi, 'Portuguese'],
  [/\bimóveis\b/gi, 'properties'],
  [/\bimovel\b/gi, 'property'],
  [/\bimóvel\b/gi, 'property'],
  [/\bquartos\b/gi, 'rooms'],
  [/\bquarto\b/gi, 'room'],
  [/\bpropriedades\b/gi, 'properties'],
  [/\bpropriedade\b/gi, 'property'],
  [/\bdisponíveis\b/gi, 'available'],
  [/\bdisponível\b/gi, 'available'],
  [/\bindisponível\b/gi, 'unavailable'],
  [/\bpreço\b/gi, 'price'],
  [/\bvalor\b/gi, 'price'],
  [/\bregião\b/gi, 'area'],
  [/\bestação\b/gi, 'station'],
  [/\batendimento em português\b/gi, 'Portuguese-speaking support'],
  [/\bsuporte em português\b/gi, 'Portuguese-speaking support'],
  [/\bpor semana\b/gi, 'per week'],
  [/\bsemanal\b/gi, 'weekly'],
  [/\borçamento\b/gi, 'budget'],
  [/\bqual é o\b/gi, 'what is the'],
  [/\bqual região\b/gi, 'which area'],
  [/\bpor mês\b/gi, 'per month'],
  [/\bpor mes\b/gi, 'per month'],
  [/\bentrada imediata\b/gi, 'immediate move-in'],
  [/\bentrada\b/gi, 'move-in'],
  [/\bbanheiro privativo\b/gi, 'private bathroom'],
  [/\bcozinha equipada\b/gi, 'equipped kitchen'],
  [/\blavanderia\b/gi, 'laundry'],
  [/\bmobiliado\b/gi, 'furnished'],
  [/\bcama\b/gi, 'bed'],
  [/\bguarda-roupa\b/gi, 'wardrobe'],
  [/\bmesa de estudos\b/gi, 'study desk'],
  [/\bjardim\b/gi, 'garden'],
  [/\bestacionamento\b/gi, 'parking'],
  [/\bcontas inclusas\b/gi, 'bills included'],
  [/\bbills inclusas\b/gi, 'bills included'],
  [/\bfotos\b/gi, 'photos'],
  [/\bdetalhes\b/gi, 'details'],
  [/\bperguntas frequentes\b/gi, 'FAQ'],
  [/\bresultados\b/gi, 'results'],
  [/\bresultado\b/gi, 'result'],
  [/\bsem resultados\b/gi, 'no results'],
  [/\bver mais\b/gi, 'view more'],
  [/\blimpar\b/gi, 'clear'],
  [/\bfiltros\b/gi, 'filters'],
  [/\bfiltro\b/gi, 'filter'],
  [/\bcompartilhar\b/gi, 'share'],
  [/\bdescrição\b/gi, 'description'],
  [/\bpontos próximos\b/gi, 'nearby places'],
  [/\bpróximos\b/gi, 'nearby'],
  [/\binício\b/gi, 'home'],
  [/\bvoltar\b/gi, 'back'],
  [/\bagendar visita\b/gi, 'schedule a viewing'],
  [/\bfalar no whatsapp\b/gi, 'chat on WhatsApp'],
  [/\bcarregando\b/gi, 'loading'],
  [/\bsincronizando\b/gi, 'syncing'],
  [/\bbuscando\b/gi, 'searching'],
  [/\bagora\b/gi, 'now'],
  [/\bdisponível agora\b/gi, 'available now'],
  [/\bdisponíveis agora\b/gi, 'available now'],
  [/\bseleção\b/gi, 'selection'],
  [/\blocalização\b/gi, 'location'],
  [/\bvalores semanais\b/gi, 'weekly prices'],
  [/\bequipe\b/gi, 'team'],
  [/\bexperiência\b/gi, 'experience'],
  [/\bmercado\b/gi, 'market'],
  [/\bestrutura local\b/gi, 'local structure'],
  [/\boperação profissional\b/gi, 'professional operation'],
  [/\bsuporte humano\b/gi, 'human support'],
  [/\baté a mudança\b/gi, 'until move-in'],
  [/\bescolhas rápidas\b/gi, 'quick choices'],
  [/\bescolhas\b/gi, 'choices'],
  [/\brápidas\b/gi, 'quick'],
  [/\bresultado aparece aqui\b/gi, 'result appears here'],
  [/\bresultado\b/gi, 'result'],
  [/\baparece aqui\b/gi, 'appears here'],
  [/\bfale conosco\b/gi, 'talk to us'],
  [/\bfalar com a equipe\b/gi, 'speaking with the team'],
  [/\bmais imóveis\b/gi, 'more properties'],
  [/\bmais opções\b/gi, 'more options'],
  [/\bdisponibilidade\b/gi, 'availability'],
  [/\bAté £/gi, 'Up to £'],
  [/\bAte £/gi, 'Up to £'],
  [/(\d+)\s+propriedades/gi, '$1 properties'],
  [/(\d+)\s+propriedade/gi, '$1 property'],
  [/(\d+)\s+resultados/gi, '$1 results'],
  [/(\d+)\s+resultado/gi, '$1 result'],
  [/(\d+)\s+pessoas/gi, '$1 people'],
  [/(\d+)\s+pessoa/gi, '$1 person'],
  [/(\d+)\+\s+pessoas/gi, '$1+ people'],
  [/(\d+)\+\s+pessoa/gi, '$1+ person'],
];

const textNodeOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const translatedTextNodes = new WeakSet<Text>();
const translatedAttributes = new WeakSet<Element>();
const translatableAttributes = ['aria-label', 'title', 'placeholder', 'alt'];

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function translateText(text: string, language: SiteLanguage) {
  if (language === 'pt') return text;

  const trimmed = normalizeText(text);
  if (!trimmed) return text;

  const exact = textTranslations[trimmed];
  if (exact) return text.replace(trimmed, exact);

  let translated = text;
  phraseTranslations.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });

  return translated;
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true;
  if (element.closest('[data-no-translate], script, style, noscript, svg, input, textarea')) {
    return true;
  }
  return false;
}

function translateElementAttributes(element: Element, language: SiteLanguage) {
  if (shouldSkipElement(element)) return;

  translatableAttributes.forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;

    let originals = attributeOriginals.get(element);
    if (!originals) {
      originals = new Map();
      attributeOriginals.set(element, originals);
    }
    if (!originals.has(attribute)) originals.set(attribute, value);

    const original = originals.get(attribute) || value;
    element.setAttribute(attribute, language === 'pt' ? original : translateText(original, language));
  });

  translatedAttributes.add(element);
}

function applyTranslation(root: ParentNode, language: SiteLanguage) {
  if (window.location.pathname.startsWith('/admin')) {
    document.documentElement.lang = 'pt-BR';
    return;
  }

  document.documentElement.lang = language === 'en' ? 'en-GB' : 'pt-BR';

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
      return normalizeText(node.textContent || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  textNodes.forEach((node) => {
    if (!textNodeOriginals.has(node)) {
      textNodeOriginals.set(node, node.textContent || '');
    }

    const original = textNodeOriginals.get(node) || '';
    const nextText = language === 'pt' ? original : translateText(original, language);
    if (node.textContent !== nextText) node.textContent = nextText;
    translatedTextNodes.add(node);
  });

  if (root instanceof Element) translateElementAttributes(root, language);
  root.querySelectorAll?.('*').forEach((element) => translateElementAttributes(element, language));
}

function restoreTranslations() {
  document.documentElement.lang = 'pt-BR';

  document.querySelectorAll('*').forEach((element) => {
    if (!translatedAttributes.has(element)) return;
    const originals = attributeOriginals.get(element);
    originals?.forEach((value, attribute) => element.setAttribute(attribute, value));
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    if (translatedTextNodes.has(node)) {
      const original = textNodeOriginals.get(node);
      if (original !== undefined && node.textContent !== original) node.textContent = original;
    }
    current = walker.nextNode();
  }
}

function DomTranslator({ language }: { language: SiteLanguage }) {
  useEffect(() => {
    const root = document.body;
    if (!root) return;

    if (language === 'pt') {
      restoreTranslations();
    } else {
      applyTranslation(root, language);
    }

    const observer = new MutationObserver((mutations) => {
      if (language === 'pt') return;

      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData') {
          const node = mutation.target as Text;
          if (!textNodeOriginals.has(node)) textNodeOriginals.set(node, node.textContent || '');
          const original = textNodeOriginals.get(node) || '';
          const nextText = translateText(original, language);
          if (node.textContent !== nextText) node.textContent = nextText;
          return;
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            if (!textNodeOriginals.has(textNode)) textNodeOriginals.set(textNode, textNode.textContent || '');
            const nextText = translateText(textNode.textContent || '', language);
            if (textNode.textContent !== nextText) textNode.textContent = nextText;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyTranslation(node as Element, language);
          }
        });
      });
    });

    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language]);

  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>(() => {
    if (typeof window === 'undefined') return 'pt';
    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt';
  });

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: (text: string) => translateText(text, language),
    }),
    [language, setLanguage, toggleLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      <DomTranslator language={language} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
