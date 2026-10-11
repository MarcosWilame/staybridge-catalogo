# Tasks

## 1. Medição e cobertura de comportamento

- [x] 1.1 Instrumentar o início e o fim do carregamento do catálogo, da derivação dos resultados e da prontidão do primeiro conjunto de cards; verificar que os eventos registram apenas duração, contagens e códigos de falha, sem o texto integral da busca.
- [x] 1.2 Adicionar testes de regressão para os critérios atuais de busca, filtros, ordenação, resultados vazios e fallback de carregamento; verificar com `npm test -- --test-name-pattern="property|availability|cache"` ou equivalente suportado pelo runner.

## 2. Cache e carregamento do catálogo

- [x] 2.1 Ajustar `sheetProperties` e `propertyCache` para reutilizar cache compatível com a revisão, compartilhar requisições pendentes e revalidar em segundo plano sem limpar dados já exibidos; verificar com testes de cache frio, cache quente, revisão alterada e falha da rede.
- [x] 2.2 Ajustar `api/public-properties.js` para permitir cache HTTP curto com `stale-while-revalidate`, preservando headers de segurança, ausência de dados privados e o fallback RPC; verificar com teste da política de resposta e revisão manual do contrato da API.
- [x] 2.3 Preservar o caminho de recuperação existente para timeout/erro e manter os dados válidos disponíveis durante a falha; verificar simulando resposta lenta, erro 5xx e catálogo sem dados.

## 3. Busca e filtros no cliente

- [x] 3.1 Extrair uma representação derivada e normalizada dos imóveis para reutilizar texto pesquisável, localização e valores numéricos sem alterar os critérios atuais; verificar com testes determinísticos para cada filtro e combinações relevantes.
- [x] 3.2 Memoizar o resultado filtrado e ordenado usando como dependências apenas coleção, filtros e ordenação relevantes; verificar que mudanças não relacionadas não repetem a derivação e que a ordem dos resultados permanece igual à atual.
- [x] 3.3 Separar carregamento inicial de atualização de resultados em `ListingPage`; verificar que o primeiro carregamento mostra skeletons e que novas buscas/filtros mantêm cards anteriores visíveis até a conclusão, com indicador não bloqueante.

## 4. Renderização dos cards e experiência mobile

- [x] 4.1 Priorizar somente as imagens principais do primeiro conjunto visível e manter carregamento lazy progressivo para cards posteriores; verificar em desktop e mobile que texto, controles, dimensões e fallback do card aparecem antes ou junto da imagem.
- [x] 4.2 Garantir que revelar mais propriedades ou rolar não reinicia imagens já carregadas nem atrasa os cards prontos; verificar navegação por teclado, fallback de imagem e uso do carrossel do card.
- [ ] 4.3 Exibir o estado de atualização de forma responsiva nos filtros e na busca mobile sem bloquear digitação, abertura do painel ou navegação para um imóvel; verificar manualmente viewport móvel e desktop.

## 5. Integração e verificação

- [x] 5.1 Executar `npm run check` e corrigir regressões de tipos, testes ou build introduzidas pela mudança; verificar que o comando termina com sucesso.
- [ ] 5.2 Validar manualmente cache frio, cache quente, revisão atualizada, API lenta, API indisponível, busca sem resultados, filtros combinados e carregamento progressivo de imagens; registrar tempos e comportamento observado para desktop e mobile.
- [ ] 5.3 Comparar as métricas de linha de base com a implementação e documentar percentis de tempo até dados, resultados e primeiro conjunto de cards; verificar que o resultado atende à meta definida após a medição inicial.

## Workflow follow-up

- Aplicar a mudança com o workflow `openspec-apply-change` após revisão dos artefatos.
- Validar a mudança com `openspec validate "acelerar-busca-carregamento-cards" --type change`.
- Arquivar a mudança somente após implementação, testes e revisão concluídos.
