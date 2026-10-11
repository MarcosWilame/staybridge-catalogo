# Proposal

## Why

O catálogo possui duas experiências de busca: os filtros da página principal e a busca conversacional. Como cada uma mantém regras próprias de normalização, interpretação e filtragem, a mesma consulta pode retornar conjuntos diferentes ou exigir manutenção duplicada. A mudança cria um comportamento de busca consistente agora, aproveitando o mecanismo de indexação já existente e reduzindo divergências perceptíveis para quem alterna entre as duas interfaces.

## What Changes

- Criar um contrato comum de consulta e filtros para a busca principal e a busca conversacional.
- Reutilizar a mesma normalização, indexação, critérios de correspondência, disponibilidade, preço, categoria, bills e localização nas duas experiências.
- Traduzir consultas em linguagem natural do chat para o contrato comum sem perder a resposta textual e a apresentação própria do chat.
- Garantir que uma mesma consulta sobre o mesmo catálogo produza os mesmos imóveis e a mesma ordenação base nas duas superfícies.
- Adicionar testes de paridade para consultas diretas, consultas em linguagem natural, resultados vazios e critérios combinados.

## Capabilities

### New Capabilities

- `catalog-search-consistency`: comportamento compartilhado de normalização, interpretação, filtragem e ordenação do catálogo entre a página principal e a busca conversacional.

### Modified Capabilities

Nenhuma. O inventário atual não possui especificações registradas; esta mudança introduz a primeira capacidade relacionada à busca.

## Impact

- `src/app/utils/propertySearch.ts`: ampliar o mecanismo comum para aceitar o modelo de consulta necessário às duas superfícies.
- `src/app/pages/ListingPage.tsx`: preservar os filtros da página e conectá-los ao contrato comum.
- `src/app/components/PropertySearchChat.tsx`: remover regras duplicadas de busca e adaptar linguagem natural para o contrato comum.
- Testes unitários e de integração da busca, incluindo paridade entre resultados e ordenação.
- Analytics de busca, caso os eventos precisem registrar a origem sem alterar a contagem de resultados.
- Não há mudança prevista no contrato da API ou no formato persistido dos imóveis.
