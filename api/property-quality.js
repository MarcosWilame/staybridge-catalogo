const CATEGORY_LIMITS = Object.freeze({
  ensuite: 2,
  studio: 2,
  double: 2,
});

const CATEGORY_LABELS = Object.freeze({
  identity: 'Identidade',
  location: 'Localização',
  pricing: 'Preço',
  availability: 'Disponibilidade',
  capacity: 'Capacidade',
  media: 'Mídia',
  editorial: 'Conteúdo editorial',
  publication: 'Publicação',
});

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function positiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function hasLocation(property) {
  return Boolean(text(property.region) || text(property.localArea) || text(property.address) || text(property.postcode));
}

function hasPrice(property) {
  if (Array.isArray(property.priceOptions) && property.priceOptions.some((item) => positiveNumber(item?.amount))) {
    return true;
  }
  const numericPrice = String(property.price || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return Boolean(numericPrice && positiveNumber(numericPrice[0]));
}

function hasMedia(property) {
  return Boolean(text(property.image) || text(property.video) || (Array.isArray(property.images) && property.images.some(text)));
}

function usableAvailability(property) {
  const moveInDate = text(property.moveInDate).toLowerCase();
  const availabilityStatus = text(property.availabilityStatus).toLowerCase();
  return Boolean(moveInDate || availabilityStatus || property.available === true || property.listed === false);
}

function addIssue(issues, issue) {
  issues.push(Object.freeze({
    ...issue,
    severity: issue.severity || 'warning',
    categoryLabel: CATEGORY_LABELS[issue.category] || issue.category,
    fields: Object.freeze([...(issue.fields || [])]),
  }));
}

/**
 * Evaluates a normalized administrative property without changing or persisting it.
 * Blockers control publication; warnings provide actionable editorial feedback.
 */
export function evaluatePropertyQuality(property = {}) {
  const issues = [];
  const listed = property.listed === true;
  const category = text(property.category).toLowerCase();

  if (!Number.isSafeInteger(Number(property.id)) || Number(property.id) <= 0) {
    addIssue(issues, {
      id: 'identity.invalid-id', category: 'identity', severity: 'blocker', fields: ['id'],
      message: 'O imóvel precisa ter um identificador válido.',
      fix: 'Informe um ID numérico positivo antes de salvar.',
    });
  }
  if (!text(property.title)) {
    addIssue(issues, {
      id: 'identity.missing-title', category: 'identity', severity: 'blocker', fields: ['title'],
      message: 'O título do imóvel está ausente.',
      fix: 'Informe um título que identifique claramente o imóvel.',
    });
  }
  if (!hasLocation(property)) {
    addIssue(issues, {
      id: 'location.missing', category: 'location', severity: 'blocker', fields: ['region', 'localArea', 'address', 'postcode'],
      message: 'A localização do imóvel está incompleta.',
      fix: 'Informe ao menos região, área, endereço ou código postal.',
    });
  }
  if (!hasPrice(property)) {
    addIssue(issues, {
      id: 'pricing.missing', category: 'pricing', severity: 'blocker', fields: ['price', 'priceOptions'],
      message: 'O preço do imóvel está ausente ou inválido.',
      fix: 'Informe um preço maior que zero ou uma opção de preço válida.',
    });
  }
  if (!hasMedia(property)) {
    addIssue(issues, {
      id: 'media.missing', category: 'media', severity: 'blocker', fields: ['image', 'images', 'video'],
      message: 'O imóvel não possui imagem ou vídeo válido.',
      fix: 'Adicione pelo menos uma imagem ou um vídeo válido.',
    });
  }
  if (listed && !usableAvailability(property)) {
    addIssue(issues, {
      id: 'availability.missing', category: 'availability', severity: 'blocker', fields: ['moveInDate', 'availabilityStatus', 'available'],
      message: 'A disponibilidade do imóvel não está definida.',
      fix: 'Informe a data/condição de entrada ou marque a disponibilidade para confirmação.',
    });
  }

  if (listed && property.status === 'hidden') {
    addIssue(issues, {
      id: 'publication.status-listed-mismatch', category: 'publication', severity: 'blocker', fields: ['listed', 'status'],
      message: 'O imóvel está marcado como publicado, mas o status está oculto.',
      fix: 'Alinhe o status de publicação com o campo listed.',
    });
  }
  if (listed && property.status === 'available' && property.available === false) {
    addIssue(issues, {
      id: 'availability.status-mismatch', category: 'availability', severity: 'warning', fields: ['status', 'available'],
      message: 'O status indica disponibilidade, mas o campo de disponibilidade está desativado.',
      fix: 'Revise o status e a disponibilidade antes de publicar.',
    });
  }
  if (property.status === 'reserved' && property.available === true) {
    addIssue(issues, {
      id: 'availability.reserved-mismatch', category: 'availability', severity: 'warning', fields: ['status', 'available'],
      message: 'O imóvel está reservado, mas continua marcado como disponível.',
      fix: 'Confirme se o status ou a disponibilidade precisam ser ajustados.',
    });
  }
  if (category && CATEGORY_LIMITS[category] && Number(property.people) > CATEGORY_LIMITS[category]) {
    addIssue(issues, {
      id: 'capacity.category-mismatch', category: 'capacity', severity: 'blocker', fields: ['category', 'people'],
      message: `A categoria ${category} suporta no máximo ${CATEGORY_LIMITS[category]} pessoa(s).`,
      fix: 'Ajuste a capacidade ou selecione uma categoria compatível.',
    });
  }
  if (property.coordinates && ((property.coordinates.lat && Math.abs(Number(property.coordinates.lat)) > 90) || (property.coordinates.lng && Math.abs(Number(property.coordinates.lng)) > 180))) {
    addIssue(issues, {
      id: 'location.coordinates-invalid', category: 'location', severity: 'blocker', fields: ['coordinates'],
      message: 'As coordenadas do imóvel são inválidas.',
      fix: 'Revise latitude e longitude para valores geográficos válidos.',
    });
  }
  if (text(property.description).length < 40) {
    addIssue(issues, {
      id: 'editorial.short-description', category: 'editorial', severity: 'warning', fields: ['description'],
      message: 'A descrição do imóvel está curta.',
      fix: 'Adicione detalhes sobre o imóvel, localização e condições de entrada.',
    });
  }
  if (!Array.isArray(property.amenities) || property.amenities.length === 0) {
    addIssue(issues, {
      id: 'editorial.missing-amenities', category: 'editorial', severity: 'warning', fields: ['amenities'],
      message: 'Nenhuma comodidade foi informada.',
      fix: 'Adicione as principais comodidades disponíveis.',
    });
  }

  const blockers = issues.filter((issue) => issue.severity === 'blocker');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  const penalty = blockers.length * 25 + warnings.length * 5;
  const categories = [...new Set(issues.map((issue) => issue.category))];

  return Object.freeze({
    score: Math.max(0, 100 - penalty),
    isPublishable: blockers.length === 0,
    blockers: Object.freeze(blockers),
    warnings: Object.freeze(warnings),
    issues: Object.freeze(issues),
    categories: Object.freeze(categories),
  });
}

export function summarizePropertyQuality(property) {
  const quality = evaluatePropertyQuality(property);
  return {
    score: quality.score,
    isPublishable: quality.isPublishable,
    blockerCount: quality.blockers.length,
    warningCount: quality.warnings.length,
    categories: quality.categories,
    issues: quality.issues,
  };
}
