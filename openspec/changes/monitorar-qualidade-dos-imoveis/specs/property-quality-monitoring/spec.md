# Spec Delta

## Purpose

Define como o sistema identifica, classifica e acompanha problemas de qualidade nos dados dos imóveis, permitindo corrigir informações antes da publicação e preservar a confiança no catálogo público.

## ADDED Requirements

### Requirement: Avaliar completude dos imóveis

O sistema SHALL avaliar os campos essenciais de cada imóvel e informar quais dados estão ausentes, inválidos ou insuficientes para uma publicação confiável.

#### Scenario: Imóvel completo

- **WHEN** um imóvel possui identificação, título, localização, preço, disponibilidade e mídia válidos
- **THEN** a avaliação informa que os requisitos essenciais foram atendidos

#### Scenario: Campo essencial ausente

- **WHEN** um imóvel publicado ou em edição não possui um campo essencial
- **THEN** a avaliação identifica o campo ausente e informa uma ação de correção compreensível

### Requirement: Classificar problemas por severidade

Cada problema de qualidade SHALL ser classificado como bloqueio ou aviso, de acordo com o impacto que teria na publicação e na compreensão do imóvel.

#### Scenario: Problema bloqueante

- **WHEN** um imóvel não possui preço, localização ou qualquer mídia válida exigida para sua apresentação
- **THEN** o problema é classificado como bloqueio e o imóvel não pode ser publicado sem correção ou confirmação autorizada

#### Scenario: Aviso não bloqueante

- **WHEN** um imóvel possui os requisitos mínimos, mas tem descrição curta, amenidades ausentes ou informação complementar incompleta
- **THEN** o problema é classificado como aviso e o imóvel continua elegível para publicação

### Requirement: Exibir visão administrativa de qualidade

O painel administrativo SHALL exibir a situação de qualidade dos imóveis e permitir filtrar itens por severidade, estado de publicação e tipo de problema.

#### Scenario: Filtrar imóveis com bloqueios

- **WHEN** o agente seleciona o filtro de bloqueios
- **THEN** o painel exibe somente imóveis com pelo menos um problema bloqueante e informa a quantidade encontrada

#### Scenario: Abrir detalhes do problema

- **WHEN** o agente seleciona um imóvel com problemas
- **THEN** o painel apresenta os campos afetados, a severidade e a orientação de correção sem ocultar os dados já cadastrados

### Requirement: Validar publicação conforme qualidade mínima

O sistema SHALL impedir a publicação de imóveis com bloqueios de qualidade e SHALL permitir confirmação explícita para avisos não bloqueantes.

#### Scenario: Publicação bloqueada

- **WHEN** o agente tenta publicar um imóvel com problema bloqueante
- **THEN** a publicação não é executada e o sistema informa os bloqueios que precisam ser corrigidos

#### Scenario: Publicação com aviso

- **WHEN** o agente tenta publicar um imóvel que possui apenas avisos
- **THEN** o sistema apresenta os avisos e permite confirmar a publicação explicitamente

### Requirement: Detectar inconsistências entre campos

A avaliação SHALL identificar contradições entre status, disponibilidade, preço, capacidade, localização e mídia antes que elas sejam apresentadas como informação confiável ao visitante.

#### Scenario: Status e disponibilidade incompatíveis

- **WHEN** um imóvel está marcado como disponível, mas não possui data, estado ou informação de entrada utilizável
- **THEN** a avaliação registra uma inconsistência com orientação para revisar a disponibilidade

#### Scenario: Capacidade incompatível com categoria

- **WHEN** a capacidade cadastrada contradiz as regras conhecidas para a categoria do imóvel
- **THEN** a avaliação registra o conflito e identifica os campos que precisam ser revisados

### Requirement: Manter dados privados fora da avaliação pública

Os resultados de qualidade SHALL permanecer restritos ao contexto administrativo e não podem expor notas internas, campos privados ou detalhes de validação no payload público do catálogo.

#### Scenario: Payload público

- **WHEN** um imóvel com problemas de qualidade é solicitado pela API pública
- **THEN** a resposta não inclui notas internas, pontuação administrativa ou detalhes privados da avaliação

#### Scenario: Registro administrativo

- **WHEN** um agente autenticado consulta a qualidade de um imóvel
- **THEN** o sistema pode exibir os problemas necessários para correção sem tornar esses dados acessíveis ao visitante público
