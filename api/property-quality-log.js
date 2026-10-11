export function logPropertyQualityResult(property, quality, event = 'evaluate') {
  const payload = {
    event,
    propertyId: Number(property?.id) || null,
    score: quality.score,
    isPublishable: quality.isPublishable,
    blockerCount: quality.blockers.length,
    warningCount: quality.warnings.length,
    categories: quality.categories,
    timestamp: new Date().toISOString(),
  };

  // Do not log title, address, contact data, raw fields or quality messages.
  console.info('[property-quality]', JSON.stringify(payload));
  return payload;
}
