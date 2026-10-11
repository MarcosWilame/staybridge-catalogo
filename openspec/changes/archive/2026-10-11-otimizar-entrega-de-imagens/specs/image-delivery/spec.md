# Spec Delta

## Purpose

Define uma entrega de imagens de imóveis rápida, previsível e acessível para cards, galerias e páginas públicas, reduzindo bytes desnecessários sem quebrar URLs ou dados de mídia já existentes.

## ADDED Requirements

### Requirement: Priorizar imagens visíveis

O catálogo SHALL priorizar o carregamento da imagem principal dos cards e da mídia exibida no primeiro viewport antes das imagens secundárias fora da área visível.

#### Scenario: Primeiro viewport priorizado

- **WHEN** o catálogo é aberto em uma viewport mobile ou desktop
- **THEN** a imagem principal dos cards inicialmente visíveis recebe prioridade de carregamento em relação às imagens fora da viewport

#### Scenario: Galeria de imóvel aberta

- **WHEN** uma página de imóvel é carregada
- **THEN** a mídia ativa da galeria é carregada antes das miniaturas e mídias secundárias não visíveis

### Requirement: Carregar mídias secundárias progressivamente

Imagens que não estão visíveis SHALL ser carregadas progressivamente conforme se aproximam da viewport, sem bloquear a exibição dos conteúdos e resultados já disponíveis.

#### Scenario: Cards abaixo da dobra

- **WHEN** existem cards fora da área visível inicial
- **THEN** suas imagens secundárias não bloqueiam a renderização dos cards visíveis e são carregadas conforme o usuário se aproxima delas

#### Scenario: Rolagem rápida

- **WHEN** o usuário rola rapidamente até uma imagem ainda não carregada
- **THEN** o sistema inicia seu carregamento sem causar overflow horizontal, quebra de layout ou bloqueio da interação

### Requirement: Reutilizar e validar URLs de mídia

O sistema SHALL reutilizar URLs de imagem equivalentes durante uma mesma sessão e SHALL ignorar URLs vazias, duplicadas ou incompatíveis com a entrega pública antes de iniciar downloads.

#### Scenario: URLs duplicadas

- **WHEN** um imóvel contém a mesma imagem na capa e na lista de imagens
- **THEN** a imagem não é solicitada repetidamente apenas por aparecer em campos diferentes

#### Scenario: URL inválida

- **WHEN** um registro contém uma URL vazia, malformada ou não permitida
- **THEN** o sistema não inicia o download dessa URL e exibe o fallback de mídia apropriado

### Requirement: Preservar layout e acessibilidade durante a entrega

Os componentes de imagem SHALL preservar proporção e espaço reservado, fornecer texto alternativo contextual e manter um estado de fallback acessível quando o carregamento falhar.

#### Scenario: Carregamento pendente

- **WHEN** a imagem ainda está sendo carregada
- **THEN** o espaço reservado mantém a composição do card ou da galeria sem deslocamento inesperado de conteúdo

#### Scenario: Falha de carregamento

- **WHEN** a origem da imagem retorna erro ou não pode ser acessada
- **THEN** o componente exibe um fallback visual, mantém o texto alternativo e não apresenta uma imagem quebrada ao usuário

### Requirement: Entregar variantes adequadas ao dispositivo

Quando houver variantes compatíveis, o sistema SHALL selecionar uma dimensão e formato adequados à viewport e à densidade do dispositivo, mantendo uma alternativa funcional para origens sem transformação.

#### Scenario: Viewport mobile

- **WHEN** um card é exibido em uma viewport mobile estreita
- **THEN** a imagem solicitada não excede desnecessariamente a dimensão necessária para o espaço exibido

#### Scenario: Origem sem transformação

- **WHEN** a origem da imagem não oferece variantes ou transformação
- **THEN** o sistema utiliza a URL original válida sem impedir a exibição do imóvel
