# Tasks

## 1. Modelo comum de busca

- [x] 1.1 Definir e implementar o modelo canônico de filtros, consulta e ordenação em `src/app/utils/propertySearch.ts`, preservando os filtros atuais; verificar com testes unitários de preço, categoria, região, bills, capacidade, disponibilidade e data limite.
- [x] 1.2 Centralizar normalização de texto, extração de preço e instante de avaliação de disponibilidade; verificar que consultas com acentos/maiúsculas e preços equivalentes produzem os mesmos IDs.

## 2. Adaptador da busca conversacional

- [x] 2.1 Extrair o parser de linguagem natural de `PropertySearchChat.tsx` para uma unidade testável que produza filtros canônicos; verificar padrões de tipo, preço máximo, bills, disponibilidade e localização.
- [x] 2.2 Substituir a filtragem duplicada do chat pelo executor comum e preservar respostas, limite de três cards, contagem total, loading e navegação; verificar manualmente uma consulta equivalente nas duas interfaces.
- [x] 2.3 Ajustar analytics de busca para manter a origem da superfície sem alterar a contagem canônica de resultados; verificar os payloads dos eventos em testes ou inspeção local.

## 3. Paridade e regressão

- [x] 3.1 Adicionar testes com um catálogo fixo comparando IDs e ordenação entre filtros diretos e consultas convertidas pelo chat; verificar execução offline sem chamadas de rede.
- [x] 3.2 Cobrir resultados vazios, catálogo em carregamento, critérios combinados e limite de cards; verificar mensagens e contagens observáveis.
- [x] 3.3 Executar lint, build e suíte de testes do projeto; verificar que a busca existente e a mudança `acelerar-busca-carregamento-cards` continuam sem regressões.

## Workflow follow-up

- Arquivar a mudança após a implementação e revisão satisfatórias.
- Validar o resultado arquivado e confirmar a atualização da especificação principal.
