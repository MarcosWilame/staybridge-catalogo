# Proposal

## Why

A galeria desktop da página de detalhes ainda desperdiça espaço, cria áreas vazias e não apresenta fotos e vídeo com a qualidade esperada de um portal imobiliário premium. A melhoria deve tornar a primeira impressão mais forte e facilitar a exploração dos ambientes sem prejudicar a experiência mobile já existente.

## What Changes

- Reestruturar a composição da galeria desktop para usar melhor a área disponível.
- Exibir uma imagem principal ampla e mídias secundárias equilibradas, sem grandes blocos vazios.
- Manter o acesso evidente a todas as fotos, contador, vídeo e lightbox.
- Garantir que fotos em proporções diferentes sejam apresentadas sem distorção e com enquadramento consistente.
- Preservar navegação por teclado, rótulos acessíveis e o comportamento responsivo mobile.
- Adicionar cobertura de testes para a composição e os estados principais da galeria.

## Capabilities

### New Capabilities

- `property-gallery`: apresentação responsiva e acessível de fotos e vídeos na página de detalhes do imóvel.

### Modified Capabilities

Nenhuma. O projeto ainda não possui especificações existentes.

## Impact

- `src/app/pages/PropertyDetailsPage.tsx` e estilos utilitários da galeria.
- Componentes de mídia e lightbox já reutilizados pela página.
- Testes de página, acessibilidade e comportamento responsivo.
- Nenhuma alteração planejada em Supabase, APIs, schema de imóveis ou armazenamento de mídia.
