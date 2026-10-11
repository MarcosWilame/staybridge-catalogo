# Design

## Context

Conforme a proposta e à especificação `catalog-search-consistency`, a página principal já centraliza parte da filtragem e indexação em `src/app/utils/propertySearch.ts`, enquanto `PropertySearchChat.tsx` mantém um interpretador e uma filtragem paralelos. O catálogo é carregado como uma coleção compartilhada de imóveis, portanto a unificação pode ocorrer no cliente sem alterar o contrato da API.

## Goals / Non-Goals

**Goals:**

- Definir um modelo canônico de filtros e ordenação que possa ser usado por ambas as superfícies.
- Separar a interpretação de linguagem natural da execução da busca, permitindo testar cada parte.
- Preservar a experiência visual e textual do chat, inclusive o limite de cards exibidos.
- Manter a indexação em memória e a performance obtida pela mudança `acelerar-busca-carregamento-cards`.

**Non-Goals:**

- Não introduzir busca remota, novo provedor de pesquisa ou alteração do formato dos imóveis.
- Não transformar o chat em um assistente generativo nem inferir critérios fora do conjunto suportado.
- Não mudar a identidade visual, os textos de resposta ou a navegação para os detalhes dos imóveis além do necessário para a paridade.

## Decisions

### Modelo canônico de consulta

Ampliar o utilitário de busca existente para aceitar um modelo comum de filtros, com busca textual, região, categoria, faixa de preço, disponibilidade, bills, capacidade e data limite de entrada. O resultado canônico deve ser uma lista ordenada de imóveis; cada superfície decide apenas como renderizar essa lista.

Isso é preferível a manter uma segunda implementação no chat porque evita divergências na normalização, no cálculo de disponibilidade e no preço. Também preserva o ganho de indexação já existente.

### Adaptador de linguagem natural

Extrair do chat um adaptador puro que converta texto em filtros canônicos. O adaptador deve reconhecer apenas padrões explícitos e reutilizar a mesma normalização de texto e os mesmos valores de categoria aceitos pelo catálogo. Termos não reconhecidos permanecem como busca textual, sem ampliar resultados por suposição.

Uma camada de parsing dedicada é preferível a incorporar regexes no filtro ou a chamar um serviço externo: mantém a busca determinística, rápida, testável offline e sem nova dependência.

### Ordenação e apresentação

O chat chamará a busca comum com a ordenação base definida para a consulta e limitará a lista somente depois da filtragem. O total será calculado antes do `slice`, para que a resposta continue informando a quantidade real de resultados.

### Observabilidade

Manter os eventos existentes de busca e, se necessário, acrescentar somente uma dimensão de origem (`catalog` ou `chat`). A contagem de resultados deve vir do resultado canônico, permitindo comparar paridade sem registrar dados pessoais adicionais.

### Alternativas consideradas

- **Duplicar a lógica atual e sincronizar manualmente:** rejeitada por manter o problema estrutural e aumentar o risco de regressão.
- **Enviar toda busca ao servidor:** rejeitada nesta mudança por adicionar latência, depender de contrato/API novo e não ser necessária para o volume atual do catálogo.
- **Usar busca difusa ou um serviço de IA:** rejeitada por tornar resultados menos previsíveis e dificultar a explicação dos filtros aplicados.

## Risks / Trade-offs

- [Interpretação ambígua de linguagem natural] → reconhecer somente padrões suportados, manter a consulta textual e cobrir casos limítrofes com testes.
- [Diferenças entre preço textual e `priceOptions`] → definir uma única regra de extração e aplicá-la em todos os filtros e ordenações.
- [Datas calculadas em momentos diferentes] → centralizar o instante de avaliação por execução da busca para que disponibilidade seja consistente.
- [Mudança acidental na ordenação existente] → preservar testes de ordenação e comparar IDs antes/depois com um conjunto fixo de imóveis.

## Migration Plan

1. Extrair o parser do chat e adaptar sua saída ao modelo canônico.
2. Fazer a página principal e o chat consumirem o mesmo executor de busca.
3. Adicionar testes de unidade para parser, filtros e paridade de resultados.
4. Validar manualmente buscas equivalentes nas duas superfícies e publicar como alteração compatível.
5. Em caso de regressão, reverter a integração do chat para a versão anterior mantendo o utilitário comum intacto para investigação.

## Open Questions

Nenhuma questão bloqueante. A lista inicial de intenções suportadas é a já exposta pelo chat e pelos filtros atuais; novas intenções podem ser adicionadas em mudanças posteriores com cenários próprios.
