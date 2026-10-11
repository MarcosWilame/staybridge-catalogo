# Tasks

## 1. Baseline e contrato de mídia

- [x] 1.1 Mapear os pontos de entrega de imagens em cards, detalhes, galeria, chat e endpoint público; verificar o inventário documentado contra `rg -n "<img|ImageWithFallback|getOptimizedImageUrl|property-media" src api`.
- [x] 1.2 Medir baseline de bytes, tempo até a primeira imagem útil e falhas em cache frio/quente nos viewports mobile e desktop; verificar que os resultados ficam registrados sem incluir URLs completas ou dados pessoais.
- [x] 1.3 Definir e documentar o limite inicial de imagens/cards prioritários e as dimensões-alvo por contexto a partir do baseline; verificar que os valores cobrem viewport estreito e largo sem alterar o contrato público.

## 2. Resolução e deduplicação de mídia

- [x] 2.1 Centralizar a resolução da variante `thumb`, `card` e `detail` para URLs públicas válidas, preservando `/api/property-media` e origens permitidas; verificar com testes que URLs legadas continuam produzindo uma origem funcional.
- [x] 2.2 Deduplicar URLs vazias, inválidas e repetidas no payload e nos pré-carregamentos da sessão; verificar com testes que uma mesma imagem não gera solicitações duplicadas por aparecer na capa e na galeria.
- [x] 2.3 Implementar fallback acessível para falhas de mídia, mantendo `alt`, proporção e espaço reservado; verificar com testes/componentes que erro de imagem não remove o card nem bloqueia a galeria.

## 3. Entrega responsiva e prioridade

- [x] 3.1 Aplicar dimensões, `sizes` e variante adequados aos cards sem deslocamento de layout; verificar em viewport mobile e desktop que a primeira imagem útil mantém a composição e não causa overflow.
- [x] 3.2 Limitar `eager`/prioridade alta ao primeiro conjunto visível e manter lazy loading para conteúdo fora da viewport; verificar com teste ou inspeção automatizada que imagens secundárias não bloqueiam a renderização inicial.
- [x] 3.3 Ajustar a galeria para priorizar a mídia ativa e pré-carregar apenas vizinhas imediatas com concorrência limitada; verificar navegação anterior/próxima, miniaturas e vídeo sem downloads redundantes.
- [x] 3.4 Instrumentar sucesso, falha, duração, variante e prioridade de entrega sem bloquear a navegação; verificar que métricas não contêm URL completa, endereço ou texto integral de busca.

## 4. Integração e regressão

- [x] 4.1 Validar o payload público e o endpoint de mídia com origens permitidas, URLs inválidas, imagens ausentes e múltiplas imagens; verificar que segurança, limite de coleção e compatibilidade permanecem intactos.
- [x] 4.2 Executar testes de cards, galeria, fallback, acessibilidade e cache em conjunto; verificar cobertura para cache frio/quente, mobile estreito/largo, catálogo vazio e falha de origem.
- [x] 4.3 Executar `npm run typecheck`, `npm test`, `npm run build` e `openspec validate "otimizar-entrega-de-imagens" --type change --strict`; verificar que todos passam sem regressões em busca, filtros, chat e páginas públicas.
- [x] 4.4 Comparar as métricas pós-implementação com o baseline e registrar o resultado da entrega; verificar redução ou manutenção aceitável do tempo até a primeira imagem útil e dos bytes transferidos.

## Workflow follow-up

- Arquivar a mudança após implementação e revisão visual satisfatórias.
- Validar o resultado arquivado e confirmar a atualização da especificação principal.
