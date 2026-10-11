# Design

## Context

Conforme a proposta e a especificação `public-catalog-payload`, `api/public-property-fields.js` já funciona como fronteira entre os dados internos e a resposta pública. Ele mantém uma allowlist, mas ainda serializa campos de apoio não consumidos pelas telas públicas e aceita limites amplos para textos, mídia, estações e opções de preço. O frontend usa a mesma coleção pública para listagem, busca, cards, chat e detalhes, portanto a redução precisa manter os campos atualmente consumidos por essas superfícies.

## Goals / Non-Goals

**Goals:**

- Tornar a allowlist pública explícita e documentada por testes.
- Remover campos sem consumidor público conhecido, como dados de origem e condições internas de entrada, preservando o depósito usado na página de detalhes.
- Aplicar limites determinísticos às coleções e textos sem alterar a identificação, visibilidade, filtros, preços e disponibilidade dos imóveis.
- Medir a redução serializada em um fixture representativo e manter o cache público compatível.

**Non-Goals:**

- Não criar uma segunda chamada de detalhes nem alterar a estratégia de carregamento do frontend nesta mudança.
- Não alterar o formato interno do Supabase, os dados administrativos ou o endpoint de página/SEO.
- Não remover campos usados pela galeria, cards, mapa, busca, detalhes, compartilhamento ou metadados públicos.
- Não registrar conteúdo de imóveis ou dados pessoais em analytics de tamanho.

## Decisions

### Allowlist centralizada no sanitizador público

Manter `toPublicProperty` como único ponto de seleção e normalização. A resposta preservará os campos atualmente consumidos: identidade, mídia, título, localização pública, preço, descrição, disponibilidade, categoria, amenities, estações, furnishing, postcode, ocupação, depósito e opções de preço. Campos internos sem uso público (`sourceText` e `entryConditions`) serão removidos do contrato.

Isso evita espalhar regras pelo endpoint e mantém a barreira de segurança existente. Um endpoint separado de resumo seria mais eficiente em teoria, mas exigiria mudar a carga de detalhes e introduzir fallback/compatibilidade fora do escopo.

### Limites de payload

Adotar limites constantes e testáveis no sanitizador: `description` até 500 caracteres, `longDescription` até 3.000, até 10 imagens, até 10 estações e até 6 opções de preço. As URLs são validadas antes do limite, para que entradas inválidas não consumam espaço permitido. Os limites devem ser definidos em um único bloco próximo às funções de normalização.

### Compatibilidade de mídia e cache

Preservar a conversão de mídias Supabase para `/api/property-media` e a seleção de `image`/`coverMedia`. A chave e o versionamento de cache permanecem compatíveis; a redução do corpo passa a ser verificada por teste de serialização, sem adicionar cabeçalhos ou dependências externas.

### Medição

Adicionar fixture de imóvel com campos internos, textos e coleções acima dos limites. O teste deve comparar o tamanho JSON do resultado reduzido com uma representação anterior do mesmo fixture e também validar a allowlist. A medição fica nos testes, não em eventos de analytics, para não expor conteúdo nem aumentar o payload do usuário.

### Alternativas consideradas

- **Retornar todos os campos e apenas comprimir HTTP:** rejeitada porque não remove campos desnecessários, não reduz parsing/heap no cliente e depende de compressão do transporte.
- **Criar `/api/public-properties?view=summary` e buscar detalhes separadamente:** rejeitada nesta mudança por exigir uma alteração arquitetural no carregamento e risco de regressão na navegação/SEO.
- **Remover imagens ou descrições sem limite fixo:** rejeitada por tornar a experiência dependente do conteúdo e dificultar testes de compatibilidade.

## Risks / Trade-offs

- [Consumidor externo depende de campo não documentado] → tratar a allowlist como contrato versionado, cobrir campos removidos nos testes e registrar a quebra na proposta.
- [Limites reduzem conteúdo útil da galeria] → escolher limites conservadores, preservar a primeira imagem e validar visualmente detalhes com múltiplas mídias.
- [Frontend acessa campo removido em fluxo pouco exercitado] → mapear referências no código e executar build, testes e inspeção das telas públicas antes do rollout.
- [Fixture não representa o tráfego real] → comparar também resposta de uma amostra real anonimizada quando possível, sem persistir dados sensíveis.

## Migration Plan

1. Fixar a allowlist e os limites no normalizador público.
2. Atualizar testes de contrato existentes e adicionar fixture de tamanho/paridade.
3. Executar typecheck, testes e build; verificar listagem, busca, chat, detalhes e mídia.
4. Publicar mantendo o mesmo endpoint e cache; monitorar erros de renderização e tamanho da resposta.
5. Em caso de regressão, restaurar temporariamente os campos removidos no normalizador, mantendo os testes para orientar uma redução posterior.

## Open Questions

Nenhuma questão bloqueante. Os limites propostos são conservadores e podem ser ajustados em uma mudança posterior se métricas reais mostrarem necessidade.
