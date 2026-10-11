# Proposal

## Why

As imagens são o principal recurso visual dos cards e das páginas de imóveis, mas a entrega atual pode aumentar o tempo até o primeiro conteúdo útil, consumir banda desnecessariamente e causar carregamentos instáveis em redes móveis. Esta mudança busca reduzir o peso percebido das imagens sem comprometer a qualidade visual, a acessibilidade ou a compatibilidade com os URLs já armazenados.

## What Changes

- Definir uma estratégia única de entrega de imagens para cards, galerias e páginas públicas de imóveis.
- Priorizar imagens visíveis no primeiro viewport e carregar imagens secundárias de forma progressiva.
- Preservar dimensões, proporção, `alt` e estados de fallback durante o carregamento ou quando uma imagem falhar.
- Evitar downloads duplicados e URLs de mídia inválidos ou desnecessários no payload público.
- Avaliar formatos, parâmetros de transformação, cache e tamanhos responsivos compatíveis com o Storage já utilizado pelo projeto.
- Adicionar métricas e testes para comparar peso transferido, tempo até a primeira imagem útil e comportamento em viewport mobile.

## Capabilities

### New Capabilities

- `image-delivery`: Define como imagens públicas de imóveis são selecionadas, priorizadas, carregadas progressivamente, armazenadas em cache e exibidas com fallback acessível.

### Modified Capabilities

<!-- Nenhuma capacidade existente foi registrada em openspec/specs/. -->

## Impact

- Frontend: cards de imóveis, galeria da página de detalhes, componentes de mídia e estilos responsivos.
- Backend: normalização do payload público e, se necessário, endpoint/URLs assinadas do Storage.
- Storage/CDN: formatos, cache, transformações e tamanhos responsivos das imagens públicas.
- Testes: cobertura de carregamento prioritário, lazy loading, fallback, acessibilidade e ausência de URLs duplicadas.
- Observabilidade: métricas de tempo até a primeira imagem útil, falhas de mídia e bytes transferidos.
- Não há mudança planejada no modelo de dados dos imóveis nem remoção imediata de imagens existentes.
