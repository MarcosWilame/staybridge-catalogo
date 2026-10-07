# Tasks

## 1. Contrato canônico

- [x] 1.1 Definir tipos para identidade, configuração, preços, entrada, disponibilidade e comodidades; verificar com `npm run typecheck` e testes de compilação.
- [x] 1.2 Criar normalizador puro para entradas do admin, Supabase e registros legados; verificar categorias, postcode, números e valores ausentes com testes unitários.
- [x] 1.3 Adicionar catálogo explícito de categorias, estados de disponibilidade e regras de ocupação; verificar que `ensuite`, `studio` e `double` resultam em até 2 moradores.

## 2. Cadastro, validação e persistência

- [x] 2.1 Adaptar o formulário do admin para coletar os campos canônicos e indicar campos a confirmar; verificar criação e edição de um imóvel de cada categoria.
- [x] 2.2 Atualizar a validação da API e a persistência para rejeitar valores inválidos sem apagar conteúdo editorial; verificar mensagens de erro por campo.
- [x] 2.3 Manter aliases de leitura para os campos antigos durante a transição; verificar que imóveis existentes continuam carregando antes da migração.

## 3. Normalização dos dados existentes

- [x] 3.1 Criar rotina somente leitura que produza relatório de conversões e ambiguidades; verificar contagem, IDs e campos não convertidos.
- [x] 3.2 Corrigir automaticamente apenas conversões seguras e registrar origem/valor original quando houver ambiguidade; verificar amostra de imóveis reais.
- [x] 3.3 Executar migração controlada com backup e validação pós-migração; verificar cards, filtros, página de detalhes e SEO.

## 4. Consumo público e qualidade

- [x] 4.1 Atualizar cards, filtros, detalhes, SEO e compartilhamento para consumirem o contrato canônico; verificar que nenhuma tela depende de texto livre para preço ou disponibilidade.
- [x] 4.2 Adicionar testes de regressão para preços múltiplos, bills, datas futuras, confirmação de disponibilidade e ocupação; verificar `npm test`.
- [x] 4.3 Rodar validação OpenSpec, typecheck, build e revisão visual no preview; verificar `openspec validate padronizar-campos-imoveis --type change --strict`, `npm run typecheck` e `npm run build`.

## Workflow follow-up

- Revisar os artefatos antes de iniciar a implementação.
- Aplicar o change com o workflow OpenSpec e arquivar somente após a migração e os testes passarem.
