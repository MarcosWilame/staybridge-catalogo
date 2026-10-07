# Spec Delta

## Purpose

Oferecer uma galeria de mídia imobiliária clara, premium e responsiva, permitindo que visitantes compreendam os ambientes rapidamente e naveguem por fotos e vídeos sem perder contexto.

## ADDED Requirements

### Requirement: Galeria desktop aproveita o espaço disponível
Em telas desktop, o sistema SHALL apresentar uma mídia principal ampla e mídias secundárias organizadas em uma composição equilibrada, sem áreas vazias causadas por alturas fixas incompatíveis com a quantidade de mídias.

#### Scenario: Imóvel com pelo menos três mídias
- **WHEN** o visitante abre os detalhes de um imóvel com três ou mais fotos ou vídeos
- **THEN** a mídia principal ocupa a maior área visual e as mídias secundárias preenchem a coluna restante de forma alinhada

#### Scenario: Imóvel com uma ou duas mídias
- **WHEN** o visitante abre os detalhes de um imóvel com menos de três mídias
- **THEN** a composição mantém proporções equilibradas e não exibe um painel secundário vazio desproporcional

### Requirement: Mídias preservam enquadramento e proporção
As imagens e os vídeos SHALL preencher seus respectivos painéis sem distorção, mantendo um enquadramento consistente e sem expor espaços vazios desnecessários.

#### Scenario: Imagens com proporções diferentes
- **WHEN** a galeria contém imagens verticais e horizontais
- **THEN** cada mídia é exibida sem deformação e com corte visual previsível dentro do painel

### Requirement: Visitante consegue acessar a galeria completa
O sistema SHALL manter um controle visível para abrir o lightbox completo, com contador de mídias e navegação anterior/próxima para fotos e vídeos.

#### Scenario: Abertura do lightbox
- **WHEN** o visitante seleciona a galeria ou uma miniatura
- **THEN** o lightbox abre na mídia selecionada e informa a posição atual no conjunto

#### Scenario: Navegação no lightbox
- **WHEN** o visitante usa os controles de navegação ou as teclas de seta
- **THEN** a galeria muda para a mídia anterior ou próxima sem fechar o lightbox

### Requirement: Galeria permanece responsiva e acessível
O sistema SHALL adaptar a galeria para telas menores e SHALL fornecer nomes acessíveis, foco visível e fechamento previsível do lightbox.

#### Scenario: Visualização mobile
- **WHEN** o visitante acessa a página em uma tela menor que o breakpoint desktop
- **THEN** a galeria usa uma mídia principal com navegação simples, contador e acesso às miniaturas ou à galeria completa

#### Scenario: Fechamento acessível
- **WHEN** o lightbox está aberto e o visitante pressiona Escape ou seleciona o botão de fechar
- **THEN** o lightbox fecha e o foco retorna ao controle que o abriu
