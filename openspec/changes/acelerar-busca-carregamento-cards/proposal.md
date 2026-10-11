# Proposal

## Why

Atualmente existe uma espera perceptível entre a pesquisa ou alteração de filtros e a exibição dos cards de imóveis. O catálogo é carregado de forma integral, a rota pública desabilita cache e os primeiros cards não recebem prioridade explícita de carregamento, o que aumenta o tempo até o primeiro resultado útil. A mudança deve reduzir o tempo percebido sem comprometer a atualização dos dados, a consistência dos resultados ou a experiência em dispositivos móveis.

## What Changes

- Medir separadamente o tempo de carregamento do catálogo, aplicação da busca/filtros e renderização do primeiro conjunto de cards.
- Reestruturar o carregamento público para reutilizar respostas válidas e atualizar dados em segundo plano, mantendo um caminho de recuperação quando a API principal falhar.
- Evitar trabalho repetido na normalização, indexação, filtragem e ordenação dos imóveis durante a digitação e a troca de filtros.
- Priorizar o carregamento das imagens dos primeiros cards visíveis e manter carregamento progressivo para os demais.
- Exibir estados de carregamento que preservem resultados já exibidos durante uma nova busca, evitando a sensação de tela vazia ou bloqueada.
- Adicionar testes e telemetria para confirmar o tempo até resultados úteis, o comportamento de cache e a ausência de regressões nos filtros.

## Capabilities

### New Capabilities

- `property-search-performance`: Define o comportamento de carregamento, busca, filtragem, priorização dos cards e medição de desempenho do catálogo.

### Modified Capabilities

<!-- Nenhuma capacidade existente foi registrada em openspec/specs/. -->

## Impact

- Frontend: `src/app/data/sheetProperties.ts`, `src/app/data/propertyCache.ts`, `src/app/pages/ListingPage.tsx`, `src/app/components/PropertyCard.tsx` e utilitários relacionados.
- Backend: `api/public-properties.js`, incluindo cabeçalhos e estratégia de cache da resposta pública.
- Testes: novos testes de cache, indexação/filtragem, estados de carregamento e métricas de performance.
- Observabilidade: eventos existentes de busca e filtros poderão receber tempos de carregamento e contagem de cards priorizados.
- Não há mudança planejada no contrato público dos dados de imóveis nem dependência externa obrigatória.
