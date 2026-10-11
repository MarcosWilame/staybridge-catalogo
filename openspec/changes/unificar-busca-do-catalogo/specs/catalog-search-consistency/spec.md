# Spec Delta

## Purpose

Esta capacidade garante que todas as interfaces de busca do catálogo interpretem e filtrem imóveis de forma consistente. Ela reduz resultados divergentes entre a busca principal e o chat, mantendo respostas compreensíveis para consultas diretas e em linguagem natural.

## ADDED Requirements

### Requirement: Shared query matching

The catalog search surfaces SHALL use the same normalization and matching semantics for property text, including accents, case, region, local area, postcode, address, type, category, description and nearby stations.

#### Scenario: Direct query has equivalent matches

- **WHEN** a user searches for the same term in the main catalog and in the conversational search
- **THEN** both surfaces include the same matching property IDs when no additional filter intent is present

#### Scenario: Accents and case do not change matching

- **WHEN** equivalent queries differ only by capitalization or diacritics
- **THEN** they return the same matching property IDs in both surfaces

### Requirement: Natural-language intent maps to catalog filters

The conversational search SHALL translate supported natural-language intent into the same catalog filter semantics used by the main search for category, maximum price, bills inclusion, availability, people capacity and location.

#### Scenario: Combined natural-language filters

- **WHEN** a user asks for a studio with bills included, a maximum weekly price and a named region
- **THEN** the conversational results satisfy every recognized criterion using the catalog filter semantics

#### Scenario: Unsupported wording does not broaden results

- **WHEN** the conversational query contains wording that cannot be mapped confidently to a supported filter
- **THEN** the system applies only the recognized criteria and retains the shared text-matching behavior

### Requirement: Consistent result ordering

The main catalog and conversational search SHALL apply the same base ordering to equivalent queries, while the conversational surface MAY limit the displayed subset without changing the total match count.

#### Scenario: Same query has stable ordering

- **WHEN** both surfaces run an equivalent query against the same catalog snapshot
- **THEN** the ordered property IDs are identical before any surface-specific display limit

#### Scenario: Chat limits visible cards

- **WHEN** a conversational query matches more properties than the chat display limit
- **THEN** the chat reports the full match count and displays the leading properties in the shared order

### Requirement: Consistent empty and loading behavior

The search surfaces SHALL communicate loading and empty-result states consistently with the actual catalog state and SHALL NOT fabricate properties or counts.

#### Scenario: No matches

- **WHEN** a valid query matches no property
- **THEN** both surfaces show an empty-result state and the conversational response reports zero matches

#### Scenario: Catalog is loading

- **WHEN** a user submits a query before the catalog data is available
- **THEN** the search prevents a misleading result and indicates that the catalog is still loading

### Requirement: Search parity is regression-tested

The project SHALL maintain automated coverage for parity between the main and conversational search across direct terms, natural-language filters, combined criteria, empty results and equivalent normalized queries.

#### Scenario: Regression suite detects divergent IDs

- **WHEN** the shared search behavior changes
- **THEN** automated tests compare property IDs and ordering for representative equivalent queries across both surfaces

#### Scenario: Regression suite covers natural-language criteria

- **WHEN** a supported natural-language criterion is added or changed
- **THEN** tests verify its translation and filtering behavior without requiring live network data
