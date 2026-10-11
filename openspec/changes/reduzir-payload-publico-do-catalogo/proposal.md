# Proposal

## Why

O endpoint público carrega, para todas as telas do catálogo, campos e coleções que não são necessários para a experiência atual, incluindo dados de apoio usados apenas internamente e limites generosos de texto, imagens e estações. Esse volume aumenta o tempo de transferência, parsing e armazenamento em cache no navegador; reduzir o contrato público agora complementa as melhorias recentes de busca e carregamento sem alterar o conteúdo essencial exibido ao usuário.

## What Changes

- Definir um contrato público mínimo e explícito para os dados consumidos pelo catálogo.
- Remover do payload público campos que não são usados pelas superfícies públicas e não devem ser expostos por compatibilidade acidental, preservando o depósito usado na página de detalhes.
- Reduzir limites de textos, imagens, estações e estruturas aninhadas para valores compatíveis com os componentes atuais.
- Preservar os dados necessários para listagem, busca, cards, mapa, detalhes, SEO e compartilhamento.
- Adicionar testes de contrato, tamanho relativo e regressão para garantir que a redução não remova campos essenciais nem reintroduza dados privados.
- **BREAKING**: consumidores externos que dependam de campos públicos não documentados ou de limites antigos de coleções poderão deixar de recebê-los.

## Capabilities

### New Capabilities

- `public-catalog-payload`: contrato enxuto, explícito e seguro para a resposta pública de imóveis do catálogo.

### Modified Capabilities

Nenhuma. O inventário atual não possui especificações registradas; esta mudança introduz a capacidade do contrato público do catálogo.

## Impact

- `api/public-property-fields.js`: seleção, normalização e limites do payload público.
- `api/public-properties.js`: resposta pública, cache e observabilidade do tamanho do payload, se necessário.
- `src/app/data/properties.ts` e consumidores públicos: compatibilidade com campos obrigatórios e opcionais.
- `tests/publicPropertyFields.test.mjs` e novos testes de contrato/tamanho.
- Possíveis consumidores de SEO e detalhes (`api/property-page.js`) devem continuar recebendo os dados essenciais.
- Não há alteração prevista no banco, nas propriedades administrativas ou no formato interno completo salvo no Supabase.
