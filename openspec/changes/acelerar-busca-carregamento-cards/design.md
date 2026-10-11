# Design

## Context

O catálogo usa `useProperties` para carregar a coleção completa através de `/api/public-properties`, com fallback direto para o RPC do Supabase. Há cache em memória e `sessionStorage`, mas a rota pública envia `no-store`, o carregamento inicial pode fazer retry e a página de listagem recalcula filtragem e ordenação junto com a renderização. Os cards usam imagens lazy, porém não distinguem explicitamente o primeiro conjunto visível dos cards posteriores.

Consulte `proposal.md` para a motivação e `specs/property-search-performance/spec.md` para o contrato observável.

## Goals / Non-Goals

**Goals:**

- Reduzir o tempo até a primeira lista útil e até a atualização visível após busca ou filtro.
- Manter resultados anteriores durante atualizações subsequentes, com indicação clara de progresso.
- Reutilizar dados válidos sem permitir que cache antigo ultrapasse a revisão de catálogo publicada.
- Reduzir filtragens, normalizações e ordenações repetidas sem alterar os critérios existentes.
- Priorizar imagens dos primeiros cards sem bloquear texto, controles ou navegação.
- Medir as etapas do fluxo para comparar antes e depois em desktop e mobile.

**Non-Goals:**

- Não alterar o contrato dos campos públicos de propriedades.
- Não substituir Supabase, Vercel, React ou o mecanismo atual de roteamento.
- Não implementar busca no servidor ou paginação remota nesta mudança, a menos que a medição demonstre que a otimização client-side não atende aos objetivos.
- Não remover a invalidação manual ou o fallback de disponibilidade do catálogo.

## Decisions

### 1. Cache stale-while-revalidate no cliente

Manter uma única fonte canônica de carregamento, reutilizando cache de memória e `sessionStorage` quando a revisão for compatível. A primeira renderização usa os dados válidos; a revalidação dispara em segundo plano e substitui os dados apenas quando uma resposta nova for concluída. Uma requisição em andamento continua compartilhada para evitar duplicidade entre superfícies.

Alternativa considerada: manter `no-store` e sempre aguardar a rede. Foi rejeitada porque aumenta diretamente o tempo até o primeiro card e não aproveita a invalidação por revisão já existente.

### 2. Cache HTTP público com revalidação controlada

A resposta pública deve permitir cache na borda/navegador com `stale-while-revalidate`, respeitando a revisão explícita usada pelo cliente para invalidar dados após alterações administrativas. A política não deve expor dados privados nem remover o fallback RPC.

Alternativa considerada: cachear indefinidamente a rota. Foi rejeitada por risco de catálogo desatualizado.

### 3. Índice de busca e derivação memoizada

Construir uma representação derivada por imóvel com texto de busca normalizado, termos de localização e valores numéricos necessários. Memorizar o conjunto filtrado e ordenado por coleção, filtros e ordenação atuais. A derivação deve permanecer pura para preservar exatamente os critérios existentes e facilitar testes determinísticos.

Alternativa considerada: mover toda a busca para o servidor. Foi rejeitada nesta etapa porque adicionaria latência de rede a cada alteração e exigiria mudanças no contrato da API.

### 4. Atualização não bloqueante da listagem

Separar o estado de carregamento inicial do estado de atualização. A listagem inicial usa skeletons; após haver resultados, mudanças de busca/filtro mantêm os cards anteriores enquanto o novo resultado é derivado, sem limpar o grid. O estado visual deve comunicar atualização sem impedir interação ou navegação.

Alternativa considerada: mostrar spinner em tela inteira a cada tecla. Foi rejeitada por piorar a percepção de velocidade e causar instabilidade visual.

### 5. Prioridade explícita para imagens visíveis

Os primeiros cards renderizados recebem indicação de carregamento prioritário e dimensões estáveis; cards fora do primeiro conjunto continuam lazy. O componente de imagem deve preservar fallback, `sizes`, dimensões e acessibilidade atuais.

Alternativa considerada: carregar todas as imagens imediatamente. Foi rejeitada por aumentar consumo de banda e piorar mobile.

### 6. Métricas por etapa

Adicionar métricas client-side usando os eventos de analytics existentes, com timestamps para início/fim do carregamento do catálogo, conclusão da derivação dos resultados e prontidão do primeiro conjunto de cards. Registrar somente duração, contagens e códigos de falha; não enviar o texto integral da busca como nova informação de telemetria.

## Risks / Trade-offs

- [Dados exibidos podem ficar momentaneamente desatualizados] → Vincular cache à revisão publicada, limitar TTL e manter revalidação em foco/visibilidade.
- [Política de cache pode servir resposta antiga na borda] → Usar `stale-while-revalidate` com janela curta e invalidar revisão após alterações administrativas.
- [Memoização pode produzir resultados incorretos se houver dependências incompletas] → Centralizar entradas derivadas, usar chaves estáveis e cobrir combinações de filtros nos testes.
- [Prioridade excessiva de imagens pode competir com conteúdo crítico mobile] → Limitar prioridade ao primeiro conjunto visível e medir bytes/tempo antes e depois.
- [Métricas podem variar entre redes e dispositivos] → Comparar percentis e separar carregamento quente de frio, em vez de usar uma única média.

## Migration Plan

1. Adicionar testes para o comportamento atual de filtros, cache, atualização e renderização inicial.
2. Instrumentar as métricas sem alterar a estratégia visual, estabelecendo uma linha de base.
3. Implementar cache/revalidação e derivação memoizada atrás do comportamento atual.
4. Introduzir atualização não bloqueante e prioridade limitada das primeiras imagens.
5. Executar `npm run check` e validar manualmente desktop, mobile, cache frio, cache quente, falha da API e catálogo vazio.
6. Publicar observando erros de carregamento, contagem de resultados e percentis de latência; reverter as mudanças de cache ou prioridade de imagem separadamente se necessário.

## Open Questions

- Qual percentil de tempo até o primeiro card será usado como meta de aceitação após a linha de base ser coletada?
- A quantidade ideal de cards no primeiro conjunto deve ser definida por viewport ou por um limite fixo testado em mobile e desktop?
