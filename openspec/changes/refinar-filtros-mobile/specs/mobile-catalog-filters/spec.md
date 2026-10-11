# Spec Delta

## Purpose

Esta capacidade torna a edição de filtros do catálogo previsível e acessível em telas pequenas. O usuário consegue revisar alterações, entender a contagem de resultados e aplicar ou cancelar a edição sem perder o contexto da busca.

## ADDED Requirements

### Requirement: Mobile filters use an editable draft

The mobile filter panel SHALL edit a draft separate from the applied catalog filters until the user explicitly applies the changes.

#### Scenario: Opening the panel starts from applied filters

- **WHEN** the user opens the mobile filter panel
- **THEN** the draft contains the exact currently applied search and filter values

#### Scenario: Editing does not apply immediately

- **WHEN** the user changes a mobile filter while the panel is open
- **THEN** the catalog results, URL and applied filter chips remain unchanged until the user applies the draft

### Requirement: Mobile filters support apply and cancel

The mobile filter panel SHALL provide explicit actions to apply the draft or cancel the edit and SHALL restore the applied state on cancel or dismiss.

#### Scenario: Applying filters updates the catalog

- **WHEN** the user activates the apply action
- **THEN** the draft becomes applied, the URL is synchronized, the result count updates and the panel closes

#### Scenario: Canceling discards edits

- **WHEN** the user activates cancel, closes the panel or presses Escape
- **THEN** the draft is discarded, the previously applied filters remain active and the previous result set is restored

### Requirement: Mobile panel communicates result impact

The mobile filter panel SHALL keep a visible summary of active criteria and an apply action that communicates the number of matching results for the current draft.

#### Scenario: Draft count is visible

- **WHEN** the user changes criteria in the panel
- **THEN** the footer shows the count produced by the draft, including zero-result counts

#### Scenario: Clearing draft filters is reversible

- **WHEN** the user selects clear filters while editing and then cancels
- **THEN** the applied filters and results return to their state before the panel was opened

### Requirement: Mobile filter controls are accessible and touch-friendly

The mobile filter panel SHALL expose a labeled dialog, visible focus states, keyboard dismissal, scrollable content with a persistent action footer and controls with a minimum comfortable touch target.

#### Scenario: Assistive technology identifies the dialog

- **WHEN** the mobile panel opens
- **THEN** focus moves to the close control and the dialog has an accessible name and modal semantics

#### Scenario: Keyboard and viewport interaction remain usable

- **WHEN** the user navigates controls with a keyboard or a small viewport
- **THEN** focus remains visible, Escape closes the panel, content scrolls independently and the apply/cancel actions remain reachable

### Requirement: Desktop and URL behavior remain compatible

Refining the mobile panel SHALL preserve desktop immediate filtering, supported URL parameters, sort selection and analytics semantics without duplicating apply events.

#### Scenario: Desktop filters remain immediate

- **WHEN** the user changes a desktop filter
- **THEN** the desktop catalog continues to update using the existing immediate behavior

#### Scenario: Applied mobile filters survive reload

- **WHEN** the user applies mobile filters and reloads or shares the resulting URL
- **THEN** the catalog reconstructs the same applied filters and result count
