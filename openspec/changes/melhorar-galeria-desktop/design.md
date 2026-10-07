# Design

## Context

A página de detalhes já possui uma galeria desktop em `PropertyDetailsPage.tsx` com uma mídia principal, uma grade lateral e lightbox compartilhado. O comportamento mobile já oferece carrossel, contador, miniaturas e suporte a vídeo. A implementação deve preservar os dados atuais (`images`, `video` e `coverMedia`) e não alterar o contrato do Supabase.

## Goals / Non-Goals

**Goals:**

- Corrigir a composição desktop para diferentes quantidades de mídia.
- Centralizar a decisão de layout em uma função previsível baseada no número de mídias.
- Reutilizar os componentes atuais de imagem, vídeo, lightbox e fallback.
- Melhorar acessibilidade sem mudar o fluxo de contato ou os dados dos imóveis.

**Non-Goals:**

- Criar um novo serviço de mídia ou alterar o Storage.
- Alterar o modelo de dados dos imóveis.
- Redesenhar a página inteira ou substituir a experiência mobile sem necessidade.

## Decisions

### 1. Layout baseado na quantidade de mídias

Manter a grade responsiva existente, mas derivar as classes e o conteúdo secundário de uma lista normalizada de mídias. Para três ou mais itens, exibir a capa à esquerda e até quatro itens secundários à direita; para uma ou duas mídias, usar uma composição de uma ou duas colunas que ocupe todo o painel.

**Alternativa considerada:** manter uma grade fixa de duas colunas em todos os casos. Foi descartada porque gera áreas vazias em imóveis com poucas mídias.

### 2. Reuso do lightbox atual

O lightbox continuará sendo a experiência completa para fotos e vídeos. A galeria desktop apenas definirá melhor o item inicial e o indicador de quantidade, evitando duplicar lógica de navegação.

**Alternativa considerada:** adicionar uma biblioteca externa de galeria. Foi descartada para evitar dependência, mudanças de comportamento e custo adicional de bundle.

### 3. Enquadramento consistente

Os painéis de mídia usarão contêineres com overflow controlado e `object-cover` para a vitrine, enquanto o lightbox manterá `object-contain` para permitir inspeção da imagem inteira. Vídeos diretos continuarão com controles apenas no lightbox ou na visualização mobile.

### 4. Acessibilidade e foco

Os botões da galeria manterão `aria-label` contextual, indicador de item atual e foco visível. A abertura do lightbox deverá registrar o elemento acionador, permitir Escape e devolver o foco ao acionador ao fechar.

## Risks / Trade-offs

- [Risco] Fotos verticais podem perder parte do enquadramento na vitrine → Mitigação: usar a vitrine como preview e preservar a imagem completa no lightbox.
- [Risco] Mudanças de classes Tailwind podem afetar breakpoints existentes → Mitigação: validar em viewport desktop, tablet e mobile e executar a suíte atual.
- [Risco] Vídeos com origem externa não possuem thumbnail confiável → Mitigação: continuar usando a primeira imagem do imóvel como fallback visual.

## Migration Plan

1. Implementar a composição no componente existente, sem migração de dados.
2. Executar typecheck, testes e build.
3. Fazer inspeção visual da página de detalhes em desktop e mobile.
4. Em caso de regressão, reverter apenas o componente e preservar os dados e mídias já existentes.
