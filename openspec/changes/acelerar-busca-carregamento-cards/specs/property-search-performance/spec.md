# Spec Delta

## Purpose

Reduzir o tempo percebido entre a intenção de pesquisa do usuário e a exibição de cards úteis no catálogo, preservando resultados consistentes, atualização dos imóveis e uma experiência responsiva em desktop e mobile.

## ADDED Requirements

### Requirement: Busca deve preservar resultados úteis durante atualização

Quando uma nova busca ou filtro for aplicado após o catálogo já ter resultados, o sistema SHALL manter os cards anteriores visíveis até que os novos resultados estejam prontos e SHALL indicar que a lista está sendo atualizada.

#### Scenario: Usuário altera a busca com resultados já carregados

- **WHEN** o usuário modifica o texto de busca ou um filtro enquanto cards estão visíveis
- **THEN** os cards atuais permanecem renderizados, um estado não bloqueante de atualização é exibido e os cards são substituídos pelos resultados correspondentes assim que o processamento terminar

#### Scenario: Primeira busca ainda não possui resultados

- **WHEN** o usuário abre o catálogo sem dados disponíveis em memória ou cache
- **THEN** o sistema exibe placeholders equivalentes aos cards e não apresenta uma lista vazia como se não houvesse resultados

### Requirement: Catálogo deve reutilizar dados válidos sem bloquear a primeira renderização

O sistema SHALL reutilizar uma resposta de catálogo ainda válida quando disponível e SHALL permitir que uma atualização posterior ocorra em segundo plano, sem impedir a exibição dos dados reutilizados.

#### Scenario: Cache de catálogo está disponível

- **WHEN** o usuário acessa o catálogo e existe uma resposta válida para a revisão atual
- **THEN** os cards são disponibilizados imediatamente a partir do cache e a atualização de rede, quando necessária, ocorre sem limpar a lista exibida

#### Scenario: Fonte remota demora ou falha

- **WHEN** a fonte remota não responde dentro do limite definido ou retorna erro
- **THEN** o sistema mantém dados válidos em cache, informa a condição de forma não bloqueante e usa o caminho de recuperação existente quando aplicável

### Requirement: Resultados da busca devem ser calculados de forma consistente

Para um mesmo conjunto de imóveis e filtros, o sistema SHALL produzir a mesma ordenação e o mesmo conjunto de resultados, sem repetir trabalho observável a cada renderização que não altera os dados ou filtros relevantes.

#### Scenario: Usuário digita uma busca válida

- **WHEN** o texto de busca muda
- **THEN** o sistema aplica os mesmos critérios de texto, região, tipo, preço, disponibilidade, contas incluídas, capacidade e data já suportados pelo catálogo e atualiza a contagem exibida

#### Scenario: Busca sem correspondências

- **WHEN** nenhum imóvel corresponde aos critérios atuais
- **THEN** o sistema exibe o estado de resultados vazios com a opção de limpar filtros, sem confundi-lo com um erro de carregamento

### Requirement: Primeiros cards devem priorizar conteúdo visual

O sistema SHALL priorizar o carregamento da imagem principal dos cards inicialmente visíveis e SHALL carregar imagens de cards fora da área inicial de forma progressiva, sem bloquear a renderização do texto e dos controles do card.

#### Scenario: Primeiros cards entram na viewport

- **WHEN** os resultados iniciais são exibidos
- **THEN** as imagens principais dos cards visíveis recebem prioridade adequada e os cards exibem dimensões estáveis enquanto as imagens carregam

#### Scenario: Usuário revela mais resultados

- **WHEN** o usuário solicita mais propriedades ou rola até cards ainda não exibidos
- **THEN** as imagens adicionais são carregadas progressivamente sem reiniciar ou atrasar os cards que já estão prontos

### Requirement: Performance do fluxo deve ser mensurável

O sistema SHALL registrar métricas suficientes para distinguir o tempo até dados do catálogo, o tempo até resultados filtrados e o tempo até o primeiro conjunto de cards visualmente pronto, sem registrar dados pessoais da busca.

#### Scenario: Busca concluída com resultados

- **WHEN** uma pesquisa produz resultados e os primeiros cards ficam prontos
- **THEN** os eventos de telemetria existentes podem registrar duração, quantidade de resultados e quantidade de cards priorizados, sem incluir conteúdo pessoal além dos metadados já permitidos

#### Scenario: Carregamento falha

- **WHEN** o catálogo não pode ser carregado por erro ou timeout
- **THEN** a falha pode ser registrada com a etapa afetada e o tipo de erro, sem armazenar a resposta completa ou credenciais
