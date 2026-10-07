# Proposal

## Why

Os imóveis são cadastrados por diferentes fluxos e mensagens livres, o que gera variações em tipo, preço, bills, ocupação, disponibilidade e condições de entrada. Isso dificulta a edição no admin, a filtragem do catálogo, a apresentação consistente e a automação de novos cadastros.

## What Changes

- Definir um contrato único para os campos públicos e administrativos dos imóveis.
- Separar valores estruturados de textos de apresentação, especialmente preços semanal/mensal, depósito, aluguel inicial e disponibilidade.
- Padronizar categorias, quantidade de moradores, quartos, localização, bills, comodidades e condições de entrada.
- Normalizar dados antigos de forma segura, preservando informações que não puderem ser convertidas automaticamente.
- Fazer o formulário administrativo, validação, filtros, cards e página de detalhes consumirem o mesmo contrato.
- Adicionar validações e testes para impedir novos cadastros fora do padrão.

## Capabilities

### New Capabilities

- `property-field-standardization`: contrato, normalização e validação consistente dos campos de imóveis usados pelo catálogo e pelo admin.

### Modified Capabilities

Nenhuma. Não há especificações existentes cadastradas no projeto.

## Impact

- `src/app/data/properties.ts` e fluxos de cadastro/edição no admin.
- Validação e persistência em `api/_property-validation.js` e `src/app/data/supabaseProperties.ts`.
- Filtros, cards, página de detalhes, SEO e geração de descrições.
- Dados existentes no Supabase, com migração/normalização controlada.
- Testes unitários e de integração dos campos padronizados.
