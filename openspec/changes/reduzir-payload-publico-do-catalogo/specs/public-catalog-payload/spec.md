# Spec Delta

## Purpose

Esta capacidade define uma resposta pública de imóveis enxuta, previsível e segura para o catálogo. O contrato deve reduzir transferência e processamento sem remover os dados necessários para busca, cards, mapa, detalhes, SEO e compartilhamento.

## ADDED Requirements

### Requirement: Public response has an explicit allowlist

The public catalog response SHALL contain only documented fields required by public catalog experiences and SHALL exclude administrative, source, audit and internal-entry fields.

#### Scenario: Internal fields never reach the public response

- **WHEN** a property contains administrative notes, source text, entry conditions or unknown fields
- **THEN** the public response excludes source text, entry conditions and unknown fields while retaining the documented public property data

#### Scenario: Existing public screens keep required fields

- **WHEN** a listed property is normalized for public consumption
- **THEN** the response retains the fields required for listing, search, card, map, detail, SEO and sharing experiences

### Requirement: Public collections and text have bounded sizes

The public catalog response SHALL apply documented size limits to text values, image/media collections, nearby-station collections and nested pricing data before serialization.

#### Scenario: Oversized property data is bounded

- **WHEN** a listed property contains text, images, stations or price options beyond the public limits
- **THEN** the response truncates or limits those collections deterministically without returning unbounded user-controlled data

#### Scenario: Media URLs remain safe after bounding

- **WHEN** a property contains valid and invalid media URLs
- **THEN** the response includes only allowed safe media URLs and applies collection limits after invalid entries are removed

### Requirement: Public payload preserves catalog behavior

Reducing the public payload SHALL NOT change the identity, visibility, price, availability, location, category or filterability of a listed property needed by the catalog.

#### Scenario: Search-relevant fields remain available

- **WHEN** the frontend loads the reduced public response
- **THEN** searches by title, type, category, region, local area, postcode, description or nearby station continue to work as before

#### Scenario: Detail-relevant fields remain available

- **WHEN** a user opens a listed property from the catalog
- **THEN** its public detail, gallery, price, amenities, location, availability, SEO and sharing content continue to render from the public response

### Requirement: Payload reduction is observable and regression-tested

The project SHALL test the public contract and measure the serialized response size against a representative fixture without exposing property content in analytics.

#### Scenario: Contract regression is detected

- **WHEN** a field outside the allowlist is added or a required field is removed
- **THEN** automated contract tests fail with the unexpected or missing field identified

#### Scenario: Size improvement is verified

- **WHEN** the public normalizer processes the representative fixture
- **THEN** the serialized reduced payload is smaller than the pre-change fixture baseline while preserving required public fields
