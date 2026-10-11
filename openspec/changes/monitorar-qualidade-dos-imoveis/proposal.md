# Proposal

## Why

A qualidade do catálogo depende de dados completos, consistentes e publicáveis, mas hoje problemas como campos ausentes, imagens inválidas, preços incompletos ou disponibilidade incoerente podem ser descobertos apenas depois que o imóvel chega à experiência pública. Um monitoramento claro permite corrigir problemas antes que prejudiquem a busca, a confiança do visitante ou o contato com a equipe.

## What Changes

- Definir regras de qualidade para os campos essenciais de um imóvel publicado.
- Calcular uma pontuação e categorias de problemas por imóvel, diferenciando bloqueios de avisos de melhoria.
- Exibir no painel administrativo uma visão filtrável dos imóveis com problemas de qualidade.
- Impedir ou solicitar confirmação explícita antes de publicar um imóvel que não atenda aos requisitos mínimos.
- Validar consistência entre status, disponibilidade, preço, capacidade, localização e mídia.
- Registrar alterações e resultados de validação sem expor dados sensíveis no catálogo público.
- Adicionar testes para regras, pontuação, filtros administrativos e proteção contra regressões no payload público.

## Capabilities

### New Capabilities

- `property-quality-monitoring`: Define a avaliação, classificação, visualização e acompanhamento da qualidade dos dados dos imóveis antes e depois da publicação.

### Modified Capabilities

<!-- Nenhuma capacidade existente cobre atualmente a qualidade editorial dos imóveis. -->

## Impact

- Backend: validação de imóveis administrativos, normalização e regras de publicação.
- Frontend administrativo: métricas, filtros, indicadores de qualidade e mensagens de correção.
- Dados públicos: somente imóveis que continuam atendendo às regras atuais de visibilidade devem ser expostos.
- Testes: novas regras de completude, consistência, mídia, preço, disponibilidade e estados de publicação.
- Observabilidade: eventos ou registros internos de falhas de qualidade, sem incluir dados pessoais ou informações privadas.
- Não há mudança planejada no modelo de contato via WhatsApp nem na estrutura pública de URLs dos imóveis.
