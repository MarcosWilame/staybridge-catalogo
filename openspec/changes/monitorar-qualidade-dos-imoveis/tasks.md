# Tasks

## 1. Avaliador de qualidade

- [x] 1.1 Criar `api/property-quality.js` com o contrato estruturado de problemas, categorias, severidades, pontuação e `isPublishable`, verificando sua importação em um teste unitário básico.
- [x] 1.2 Implementar as regras de completude para identidade, título, localização, preço, disponibilidade e mídia sobre o imóvel normalizado, verificando imóveis completos e campos ausentes nos testes unitários.
- [x] 1.3 Implementar as regras de consistência entre `listed`, status, disponibilidade, preço, capacidade, categoria, localização e mídia, verificando bloqueios e avisos específicos nos testes unitários.
- [x] 1.4 Implementar a classificação de bloqueios e avisos, a pontuação derivada e as orientações de correção, verificando que a publicação depende de bloqueios e não apenas da pontuação.
- [x] 1.5 Reutilizar os helpers existentes de status e disponibilidade sem alterar sua semântica, verificando com os testes atuais e novos casos de datas, estados e condições de entrada.

## 2. Integração administrativa e publicação

- [x] 2.1 Integrar a avaliação após `validateAdminProperty` no fluxo administrativo, verificando que erros estruturais continuam rejeitados e que problemas de qualidade retornam uma estrutura administrativa compreensível.
- [x] 2.2 Expor a avaliação calculada nas respostas administrativas autenticadas sem persistir detalhes de qualidade no payload público, verificando a resposta com teste de endpoint e controle de acesso.
- [x] 2.3 Bloquear no servidor novas publicações ou alterações para `listed=true` quando existirem problemas bloqueantes, verificando status HTTP, corpo estruturado e ausência de gravação no teste de endpoint.
- [x] 2.4 Exigir `confirmQualityWarnings: true` para publicar imóvel com apenas avisos e permitir salvar rascunho sem confirmação, verificando os dois fluxos no teste de endpoint.
- [x] 2.5 Garantir que `public-property-fields` remova pontuação, problemas, categorias e metadados internos de qualidade, verificando ausência desses campos nos testes de payload público.

## 3. Painel administrativo

- [x] 3.1 Adicionar indicadores de qualidade às métricas e à listagem do `AdminPage`, verificando visualmente e por teste de componente a exibição de estado sem depender somente de cor.
- [x] 3.2 Adicionar filtros por bloqueio, aviso, estado de publicação e categoria de problema, verificando que cada filtro retorna apenas os imóveis correspondentes e informa a quantidade encontrada.
- [x] 3.3 Criar o detalhe administrativo com campos afetados, severidade, orientação de correção e estado de confirmação, verificando navegação por teclado e mensagens acessíveis.
- [x] 3.4 Integrar a confirmação explícita de avisos ao fluxo de salvar/publicar, verificando que a segunda tentativa envia a confirmação e que bloqueios continuam impedindo a publicação.

## 4. Observabilidade e documentação

- [x] 4.1 Registrar internamente o resultado mínimo das avaliações e falhas de qualidade sem incluir dados pessoais ou detalhes privados, verificando o formato do registro e sua ausência nas respostas públicas.
- [x] 4.2 Documentar no código as categorias, severidades e regras de publicação, verificando que a documentação corresponde aos identificadores usados pelo avaliador e pelo painel.
- [x] 4.3 Adicionar cobertura para autorização, registros legados normalizados e regressão do catálogo público, verificando a execução dos testes de segurança e payload.

## 5. Integração e validação

- [x] 5.1 Executar a suíte completa de testes e corrigir regressões relacionadas à validação, administração, busca e payload público, verificando o comando de testes sem falhas.
- [x] 5.2 Executar typecheck, build e validação estrita do OpenSpec, verificando que todos os comandos concluem com sucesso.
- [x] 5.3 Validar uma amostra de imóveis completos, com bloqueios e com avisos no ambiente de desenvolvimento, verificando o fluxo de correção, confirmação e publicação.

## Workflow follow-up

- Arquivar a mudança depois que a implementação e a revisão forem concluídas.
- Verificar o status e a validação do resultado arquivado.
