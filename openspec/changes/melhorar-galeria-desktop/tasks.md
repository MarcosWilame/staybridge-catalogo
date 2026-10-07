# Tasks

## 1. Modelar a composição da galeria

- [x] 1.1 Refatorar a preparação dos itens de mídia em `PropertyDetailsPage.tsx` para distinguir capa, itens secundários e quantidade total, verificando com typecheck e inspeção dos estados com 1, 2, 3 e 5+ mídias.
- [x] 1.2 Ajustar a grade desktop para preencher a área disponível em todos os cenários, verificando visualmente a página em viewport desktop com imóveis de diferentes quantidades de fotos.
- [x] 1.3 Garantir enquadramento consistente de imagens, fallback de vídeo e indicação de mídia adicional, verificando que nenhuma imagem seja distorcida e que o lightbox continue exibindo a mídia completa.

## 2. Preservar interação e acessibilidade

- [x] 2.1 Ajustar os controles de abertura, miniaturas, contador e navegação para iniciarem o lightbox na mídia selecionada, verificando fotos e vídeos em sequência.
- [x] 2.2 Implementar ou corrigir Escape, foco visível, retorno de foco e rótulos ARIA do lightbox, verificando a navegação apenas com teclado.
- [x] 2.3 Confirmar que a experiência mobile permanece funcional, verificando carrossel, contador, miniaturas, swipe quando disponível e botão “Ver todas”.

## 3. Testes e validação integrada

- [x] 3.1 Adicionar testes para a seleção/composição dos itens de galeria e estados sem mídias secundárias, verificando execução com `npm test`.
- [x] 3.2 Executar `npm run typecheck` e `npm run build`, corrigindo regressões sem alterar o contrato de dados do Supabase.
- [x] 3.3 Fazer revisão visual final em desktop e mobile e validar que os dados, imagens, vídeos e CTA da página de detalhes continuam preservados.

## Workflow follow-up

- Arquivar a mudança depois da revisão e dos testes aprovados.
- Verificar que a especificação permanente de `property-gallery` foi atualizada no arquivamento.
