# Design

## Context

Conforme a proposta e à especificação `mobile-catalog-filters`, `ListingPage.tsx` usa hoje um único estado `filters`: os controles dentro do drawer mobile chamam `updateFilter`, sincronizam a URL e recalculam a grade imediatamente. O drawer já bloqueia o scroll do documento, fecha com Escape e move o foco para o botão de fechar, mas seu rodapé apenas fecha o painel e não representa uma etapa de aplicação.

## Goals / Non-Goals

**Goals:**

- Introduzir edição transacional apenas no painel mobile, sem duplicar a lógica de filtragem.
- Mostrar a contagem calculada para o rascunho e tornar aplicar/cancelar ações explícitas.
- Reforçar semântica de diálogo, foco, rolagem, alvos de toque e continuidade visual do sistema Staybridge.
- Manter filtros desktop, busca rápida mobile, URL, ordenação e analytics existentes compatíveis.

**Non-Goals:**

- Não alterar `filterAndSortProperties`, critérios de busca ou a ordenação do catálogo.
- Não redesenhar cards, header, busca conversacional ou o drawer desktop.
- Não adicionar dependência de componentes, biblioteca de modal ou gerenciamento global de estado.
- Não transformar o filtro em uma página/rota separada.

## Decisions

### Estado aplicado e estado de rascunho

Manter o estado atual como fonte dos resultados aplicados e criar um rascunho temporário inicializado ao abrir o painel. O painel mobile deve ler e escrever no rascunho; a grade, os chips externos e a URL continuam lendo o estado aplicado. Ao aplicar, copiar o rascunho para o estado aplicado e sincronizar uma única vez. Ao cancelar, descartar o rascunho.

Essa separação resolve a expectativa de confirmação sem alterar o comportamento desktop. Um estado global ou uma segunda implementação de filtros seria mais complexo e criaria risco de divergência.

### Contagem do rascunho

Calcular os resultados do rascunho com o mesmo `filterAndSortProperties` e o mesmo `sortBy` usados na página. O rodapé deve informar `Ver N resultados`, inclusive `Ver 0 resultados`, sem alterar a lista até aplicar.

### Estrutura do drawer mobile

Preservar o drawer lateral full-height existente, mas usar um cabeçalho com título associado por `aria-labelledby`, área central com `overflow-y-auto` e rodapé `shrink-0` sempre visível. O rodapé terá `Cancelar` como ação secundária e `Aplicar filtros` como ação primária; `Limpar` afeta apenas o rascunho. Controles devem manter no mínimo 44px de altura e o foco visível nos tokens existentes.

### Foco, fechamento e scroll

Manter o foco inicial no fechamento, restaurar o elemento que abriu o painel ao fechar e preservar o bloqueio de scroll do documento. O fechamento por overlay, botão e Escape deve passar por uma mesma função de cancelamento para nunca aplicar alterações implicitamente. Se houver navegação por teclado dentro do diálogo, o foco não deve escapar para o conteúdo bloqueado.

### Analytics

Eventos de alteração de filtro gerados dentro do rascunho devem ser emitidos no aplicar, agrupados com o estado final, para evitar registrar mudanças que foram canceladas. Cancelar e aplicar podem ter eventos próprios com contagem e origem `mobile_filters`; a busca rápida mobile mantém seu evento atual.

### Alternativas consideradas

- **Aplicar instantaneamente e apenas melhorar o visual:** rejeitada porque mantém o problema de toques acidentais e torna cancelar sem significado.
- **Duplicar a página de filtros para mobile:** rejeitada por duplicar critérios e aumentar o risco de divergência com desktop.
- **Usar um bottom sheet de biblioteca externa:** rejeitada porque o drawer atual já cobre a estrutura e introduziria dependência para um problema local.

## Risks / Trade-offs

- [Usuário pode esperar atualização instantânea] → comunicar a contagem no rascunho e usar CTA explícito `Aplicar filtros`.
- [Rascunho ficar desatualizado após refresh externo dos imóveis] → recalcular a contagem contra a coleção atual e manter os valores dos filtros independentes dos dados.
- [Analytics duplicar eventos] → centralizar o tracking de aplicação mobile e não disparar o tracking final a cada alteração do rascunho.
- [Foco escapar em viewport pequeno] → validar teclado, Escape, overlay, restauração de foco e rolagem em testes de acessibilidade.

## Migration Plan

1. Extrair helpers puros para copiar, limpar, aplicar e comparar o estado dos filtros, se necessário.
2. Integrar o rascunho ao painel mobile mantendo o executor comum de busca.
3. Substituir o rodapé de fechamento pelo conjunto cancelar/aplicar e adicionar resumo/contagem.
4. Ajustar analytics e testes de estado, URL, acessibilidade e zero resultados.
5. Executar typecheck, testes, build e validação visual em viewport mobile; reverter a integração do rascunho se houver regressão, mantendo a filtragem existente.

## Open Questions

Nenhuma questão bloqueante. A aparência deve permanecer alinhada ao `DESIGN.md`: verde para confiança, amarelo para ação primária, superfícies claras e alvos confortáveis.
