# Design

## Context

A validação administrativa existente já normaliza campos, limita tamanhos e rejeita payloads estruturalmente inválidos antes de gravar um imóvel. A publicação, porém, continua sendo controlada principalmente pelo campo `listed`, enquanto o painel administrativo oferece filtros de estado, disponibilidade, busca e métricas básicas. A camada pública também já remove campos privados antes de montar o catálogo.

O novo monitoramento precisa complementar essas garantias sem duplicar a normalização, alterar o contrato público ou esconder automaticamente imóveis legados. A implementação deve separar erros de formato, que continuam sendo rejeitados pela validação de entrada, de problemas de qualidade, que podem ser mostrados, classificados e corrigidos no fluxo administrativo.

## Goals / Non-Goals

**Goals:**

- Centralizar regras determinísticas de qualidade em um avaliador reutilizável no contexto administrativo.
- Avaliar a forma normalizada do imóvel e retornar problemas estruturados por campo, categoria, severidade e orientação de correção.
- Reutilizar as regras atuais de disponibilidade, status, mídia, preço e localização sempre que possível.
- Aplicar a avaliação no salvamento/publicação administrativo e exibir os resultados no painel com filtros e detalhes acessíveis.
- Manter os resultados, pontuação e metadados de qualidade fora das respostas públicas.
- Cobrir as regras com testes unitários, de endpoint, de segurança e de não regressão do payload público.

**Non-Goals:**

- Não criar um serviço externo, modelo de IA ou processo assíncrono de auditoria nesta primeira versão.
- Não reescrever automaticamente valores fornecidos pelo agente para “corrigir” um imóvel.
- Não mudar a semântica existente de `listed`, status, URLs públicas ou contato via WhatsApp.
- Não ocultar automaticamente imóveis já publicados apenas porque passaram a apresentar um aviso; bloqueios em registros legados serão inicialmente observados no painel e tratados no fluxo de edição.
- Não criar histórico analítico, notificações ou metas editoriais além do registro interno mínimo necessário para depuração.

## Decisions

### 1. Avaliador puro sobre o imóvel normalizado

Criar um módulo compartilhado de qualidade, preferencialmente `api/property-quality.js`, com uma função determinística como `evaluatePropertyQuality(property)`. A função recebe o resultado normalizado de `validateAdminProperty` e retorna uma estrutura estável contendo, no mínimo, `score`, `blockers`, `warnings`, `categories` e `isPublishable`.

Cada problema terá um identificador estável, severidade, campos afetados, mensagem administrativa e orientação de correção. O avaliador não fará chamadas de rede nem gravará dados. Isso permite usá-lo no endpoint, no painel e nos testes sem efeitos colaterais.

**Alternativas consideradas:** colocar as regras diretamente em `AdminPage.tsx` ou espalhá-las entre os endpoints. Essa abordagem foi descartada porque duplicaria critérios, dificultaria a aplicação do bloqueio no servidor e permitiria divergência entre a tela e a API.

### 2. Separar validação estrutural de qualidade editorial

`validateAdminProperty` continuará sendo a barreira para payloads malformados, limites excedidos e dados impossíveis de normalizar. A avaliação será executada depois dessa etapa, sobre a forma canônica do imóvel. Erros estruturais existentes, como ausência total de título ou de mídia exigida pelo validador, serão convertidos pelo fluxo administrativo em problemas bloqueantes compreensíveis quando necessário, sem duplicar a regra no avaliador.

Assim, a qualidade consegue tratar registros válidos porém incompletos, enquanto a validação continua protegendo o armazenamento contra entradas inválidas.

### 3. Registro declarativo de regras e severidade

As regras serão organizadas em uma lista declarativa ou funções nomeadas por categoria: identidade, localização, preço, disponibilidade, capacidade, status/publicação e mídia. O conjunto mínimo deve verificar campos essenciais, consistência entre `listed` e status, disponibilidade utilizável, preços apresentados, coordenadas/localização e pelo menos uma mídia válida.

Campos complementares, como descrição, amenidades e estações próximas, produzirão avisos quando ausentes ou insuficientes. Bloqueios serão reservados para situações que impedem compreender ou apresentar o imóvel com segurança. A pontuação será derivada dos problemas encontrados, mas a decisão de publicação dependerá dos bloqueios, não de um número isolado.

**Alternativa considerada:** uma pontuação única com limiar global. Foi descartada como mecanismo exclusivo porque pode mascarar um campo crítico compensando vários campos menores.

### 4. Reutilizar as regras de disponibilidade já existentes

O avaliador deve chamar ou extrair helpers das regras existentes de disponibilidade e status, em vez de criar um segundo parser de datas. Inconsistências entre `listed`, `status`, `available`, `moveInDate` e `entryConditions` serão reportadas com os campos envolvidos e sem alterar a fonte de verdade atual do painel.

### 5. Bloqueio de publicação no servidor com confirmação explícita de avisos

O fluxo de salvamento administrativo validará e avaliará o imóvel antes de aceitar uma transição para publicado. Se houver bloqueios, a API rejeitará a operação com resposta estruturada contendo os problemas. Se houver somente avisos, a primeira tentativa retornará os avisos e exigirá um sinal explícito de confirmação, como `confirmQualityWarnings: true`, na repetição da operação.

O servidor será a autoridade final; o painel apenas antecipa os problemas para melhorar a experiência. Operações de edição que mantêm o imóvel oculto poderão salvar avisos sem confirmação, permitindo correção incremental.

**Alternativa considerada:** deixar o bloqueio somente no frontend. Foi descartada porque chamadas diretas à API poderiam publicar registros sem passar pelo painel.

### 6. Exposição administrativa sem alteração do payload público

Os endpoints administrativos autenticados poderão incluir a avaliação calculada junto ao registro retornado ou em uma resposta específica de qualidade. A camada de `public-property-fields` continuará removendo qualquer resultado de qualidade, pontuação, campos privados e detalhes internos antes da resposta pública.

Não será persistido um objeto de qualidade dentro do payload público do imóvel nesta etapa. Se for necessário registrar auditoria, serão armazenados apenas metadados internos e não exibidos no catálogo.

### 7. Painel com filtros sobre resultados calculados

O `AdminPage` consumirá os resultados administrativos e acrescentará indicadores de severidade, filtros para bloqueios/avisos, estado de publicação e categoria, além de um painel de detalhes com campos afetados e ação sugerida. Os componentes devem reaproveitar os filtros e métricas já existentes, manter navegação por teclado e não depender apenas de cor para comunicar severidade.

Para evitar uma segunda implementação de regra no navegador, o painel usará os problemas retornados pelo servidor. Caso a resposta administrativa não inclua a avaliação em algum fluxo, um helper compartilhado poderá calculá-la localmente apenas como apresentação, nunca como autorização de publicação.

### 8. Testes em camadas

Serão adicionados testes unitários para imóveis completos, cada bloqueio, cada aviso e inconsistências entre campos; testes de endpoint para rejeição de bloqueios e confirmação de avisos; testes de autorização para garantir que qualidade não seja exposta sem acesso administrativo; e testes de payload público para confirmar que pontuação e detalhes internos permanecem ausentes.

## Risks / Trade-offs

- **[Regras excessivamente rígidas]** → começar com campos objetivos e críticos como bloqueios, deixar conteúdo editorial como aviso e revisar falsos positivos com uma amostra real do catálogo.
- **[Registros legados em formatos diferentes]** → executar a avaliação somente após a normalização existente e preservar a semântica atual de publicação até que o agente edite o registro.
- **[Divergência entre painel e API]** → manter a API como autoridade final e compartilhar identificadores/regras; a UI nunca poderá substituir a decisão do servidor.
- **[Pontuação criar falsa sensação de qualidade]** → exibir categorias, campos e bloqueios junto da pontuação e não usar a pontuação como único critério de publicação.
- **[Vazamento de dados internos]** → manter a avaliação nos endpoints administrativos e cobrir explicitamente a fronteira de `public-property-fields` com testes de não exposição.
- **[Confirmações adicionais aumentarem atrito]** → exigir confirmação apenas para avisos na publicação, permitindo salvar rascunhos e corrigir dados sem bloquear o trabalho administrativo.

## Migration Plan

1. Implementar o avaliador puro, o registro de regras e os testes sem alterar o comportamento público.
2. Disponibilizar a avaliação em modo de leitura no endpoint e no painel administrativo, permitindo medir a distribuição de bloqueios e avisos sobre o inventário atual.
3. Ativar o bloqueio para novas publicações e para imóveis editados, mantendo registros legados publicados sem ocultação automática.
4. Adicionar os filtros, indicadores e detalhes de correção no painel e validar o fluxo de confirmação de avisos.
5. Executar testes completos, validação do OpenSpec e uma verificação amostral de imóveis reais antes da ativação definitiva.

Para rollback, desativar o gate de publicação por configuração/feature flag e manter a avaliação em modo informativo. A remoção do bloqueio não deve reintroduzir campos de qualidade no payload público.

