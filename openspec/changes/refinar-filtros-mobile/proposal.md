# Proposal

## Why

Os filtros mobile já funcionam, mas a abertura do painel altera os resultados imediatamente e o usuário precisa interpretar sozinho o estado aplicado enquanto navega por uma folha lateral longa. Em telas pequenas, isso aumenta toques acidentais, deslocamentos de contexto e dificuldade para entender quantos resultados serão exibidos; um refinamento com estado de rascunho, resumo persistente e aplicação explícita torna a tarefa mais previsível sem mudar a lógica de filtragem.

## What Changes

- Separar filtros em edição dos filtros efetivamente aplicados enquanto o painel mobile estiver aberto.
- Exibir no painel um cabeçalho acessível, resumo de filtros ativos e rodapé fixo com contagem atualizada, limpar e aplicar.
- Permitir cancelar a edição mobile e restaurar exatamente os filtros aplicados antes da abertura.
- Preservar URL, busca, ordenação, contagem de resultados e comportamento imediato do painel desktop.
- Melhorar alvos de toque, foco, rolagem interna, fechamento por Escape e leitura por tecnologias assistivas.
- Adicionar testes de interação/estado e validação responsiva para aplicação, cancelamento, limpeza e zero resultados.

## Capabilities

### New Capabilities

- `mobile-catalog-filters`: experiência acessível e previsível para editar, revisar e aplicar filtros do catálogo em telas pequenas.

### Modified Capabilities

Nenhuma. O inventário atual não possui especificações registradas; esta mudança introduz a capacidade específica da experiência mobile.

## Impact

- `src/app/pages/ListingPage.tsx`: estado de rascunho, abertura/fechamento do painel e composição do rodapé mobile.
- `src/app/utils/propertySearch.ts`: somente se for necessário expor uma projeção de contagem ou manter a semântica existente; não há mudança prevista na filtragem.
- Testes de frontend e acessibilidade para o painel mobile.
- `trackEvent`/analytics: distinguir edição, aplicação, cancelamento e limpeza sem duplicar eventos de filtro.
- CSS/Tailwind existente e tokens de `DESIGN.md`; nenhuma nova dependência ou mudança de API.
