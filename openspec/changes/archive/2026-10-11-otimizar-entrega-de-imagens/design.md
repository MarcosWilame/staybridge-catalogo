# Design

## Context

O catálogo já centraliza a normalização pública de URLs de mídia em `api/public-property-fields.js`, usa `/api/property-media` para objetos do Storage e possui uma função de otimização de imagem consumida por cards e pela página de detalhes. `PropertyCard` já informa dimensões, `sizes`, `loading`, `decoding` e prioridade para o primeiro conjunto; a página de detalhes também pré-carrega a mídia ativa e vizinha. A mudança deve consolidar esse comportamento sem alterar o modelo público de imóveis ou tornar a galeria dependente de um provedor específico.

Consulte `proposal.md` para a motivação e `specs/image-delivery/spec.md` para o contrato observável.

## Goals / Non-Goals

**Goals:**

- Centralizar a resolução de URL, variante e prioridade de imagens públicas.
- Manter dimensões estáveis nos cards e galerias para evitar deslocamento de layout.
- Diferenciar mídia crítica, próxima e fora da viewport.
- Reutilizar URLs e pré-carregamentos já iniciados na sessão quando possível.
- Preservar `alt`, fallback visual, suporte a vídeos e compatibilidade com URLs legadas.
- Instrumentar falhas e tempos de carregamento sem enviar dados pessoais ou o texto integral da busca.

**Non-Goals:**

- Não migrar imediatamente os arquivos existentes de Storage.
- Não alterar a estrutura dos registros de imóveis nem remover o limite atual de imagens públicas.
- Não introduzir um CDN ou serviço externo obrigatório nesta mudança.
- Não recomprimir imagens no servidor em tempo real se o Storage atual não oferecer transformação segura.
- Não alterar a experiência da área administrativa além do necessário para preservar URLs válidas.

## Decisions

### 1. Manter uma camada de resolução de mídia compatível

As URLs públicas continuarão sendo normalizadas pelo backend e consumidas pelo frontend através de uma função única que escolha a variante `thumb`, `card` ou `detail`. URLs `/api/property-media` continuarão sendo aceitas como origem interna; URLs externas somente serão usadas quando estiverem na lista permitida.

Alternativa considerada: montar parâmetros de transformação diretamente em cada componente. Foi rejeitada porque duplicaria regras, dificultaria a compatibilidade com Storage e aumentaria o risco de variantes diferentes para a mesma imagem.

### 2. Usar prioridade por contexto, não por quantidade fixa global

Cards marcados como visíveis no primeiro conjunto usarão `eager`/prioridade alta; os demais permanecerão lazy. Na página de detalhes, a mídia ativa será prioritária e a anterior/próxima poderá ser pré-carregada com limite de concorrência. Miniaturas e imagens fora da interação imediata permanecerão lazy.

Alternativa considerada: priorizar todas as imagens do primeiro imóvel ou de todos os cards renderizados. Foi rejeitada porque o número de imagens varia e pode competir com scripts e conteúdo textual em redes móveis.

### 3. Preservar dimensões e usar variantes responsivas

Cards e galerias manterão `width`, `height`, proporção e `sizes` coerentes com o layout. Quando o provedor suportar variantes, a seleção será baseada no contexto visual e na largura aproximada, sem exigir `srcset` para URLs que não ofereçam transformação confiável.

Alternativa considerada: usar sempre a imagem original em alta resolução. Foi rejeitada por aumentar bytes transferidos, especialmente em mobile, sem benefício proporcional em espaços pequenos.

### 4. Deduplicar pré-carregamentos por URL final

O utilitário de pré-carregamento manterá um registro de URLs finais já solicitadas ou em andamento. A deduplicação será limitada à sessão e não impedirá que o navegador controle seu próprio cache. A troca de imagem continuará atualizando imediatamente o estado visual, mesmo quando o pré-carregamento ainda não terminou.

Alternativa considerada: manter um cache manual completo de blobs. Foi rejeitada por duplicar o cache do navegador e elevar o consumo de memória.

### 5. Fallback acessível sem esconder o conteúdo

O componente de imagem manterá o espaço reservado, usará o `alt` contextual já existente e exibirá um fallback quando a origem falhar. Erros de uma imagem secundária não deverão remover o card nem bloquear a galeria; a mídia seguinte continuará disponível para navegação.

Alternativa considerada: substituir falhas por uma imagem remota genérica obrigatória. Foi rejeitada porque adicionaria outra dependência de rede e poderia esconder a ausência real de mídia.

### 6. Métricas de entrega sem dados sensíveis

Registrar eventos com contexto mínimo: variante, prioridade, sucesso/falha, duração, viewport aproximada e identificador técnico não pessoal. As métricas serão amostradas ou limitadas para não gerar um evento por cada thumbnail e não incluir URL completa, endereço ou texto de busca.

Alternativa considerada: enviar logs detalhados de cada URL. Foi rejeitada por custo, ruído e exposição desnecessária de caminhos de Storage.

## Risks / Trade-offs

- [Prioridade alta pode aumentar concorrência de rede] → Limitar o primeiro conjunto e medir bytes/tempo em mobile antes de ampliar a prioridade.
- [Transformação de imagem pode não existir para todas as origens] → Fallback para a URL original validada e testes por tipo de origem.
- [Pré-carregamento pode antecipar downloads que o usuário não verá] → Pré-carregar somente a mídia ativa e vizinhas imediatas, com deduplicação.
- [URLs assinadas podem expirar] → Manter a resolução através do endpoint atual e tratar respostas expiradas como erro recuperável.
- [Dimensões incorretas podem distorcer o layout] → Reutilizar proporções declaradas pelos componentes e validar cards, galeria e mobile em testes visuais/manuais.
- [Falhas de métricas podem afetar a navegação] → Instrumentação não bloqueante e captura de exceções isolada do fluxo de mídia.

## Migration Plan

1. Adicionar testes para normalização, deduplicação, variantes e fallback sem alterar o comportamento atual.
2. Centralizar a resolução final da URL e preservar as variantes já usadas por cards, detalhes e chat.
3. Ajustar prioridade e carregamento progressivo nos pontos existentes, começando pelos cards do primeiro viewport.
4. Validar dimensões, `sizes`, `alt`, fallback e ausência de overflow em mobile estreito e largo.
5. Instrumentar sucesso, falha e duração com feature flag ou ativação gradual quando o ambiente permitir.
6. Executar typecheck, testes e build; observar falhas de mídia e bytes transferidos.
7. Em caso de regressão, reverter primeiro a transformação/prioridade e manter a camada de validação de URLs, que é compatível com o comportamento anterior.

## Open Questions

- O Storage atual oferece transformação de largura/formato de forma estável para todas as pastas usadas pelo catálogo?
- Qual limite de cards prioritários produz o melhor resultado no primeiro viewport mobile após a medição de baseline?
