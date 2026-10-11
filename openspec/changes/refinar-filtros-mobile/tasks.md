# Tasks

## 1. Estado transacional dos filtros

- [x] 1.1 Criar o estado de rascunho mobile e inicializá-lo com os filtros aplicados ao abrir o painel, sem alterar o fluxo imediato dos filtros desktop; verificar com testes que editar o rascunho não muda URL, chips ou resultados aplicados.
- [x] 1.2 Implementar aplicação, cancelamento, limpeza reversível e fechamento por Escape/overlay em uma única transição de estado; verificar cenários de aplicar e cancelar, incluindo retorno ao conjunto anterior de resultados.
- [x] 1.3 Calcular a contagem do rascunho usando `filterAndSortProperties` e o `sortBy` atual; verificar estados com resultados, zero resultados e filtros combinados sem duplicar a lógica de busca.

## 2. Painel mobile acessível

- [x] 2.1 Refinar o drawer mobile com título associado, ações explícitas `Cancelar` e `Aplicar filtros`, resumo de critérios e rodapé persistente; verificar semântica de diálogo, altura mínima de toque e foco visível.
- [x] 2.2 Preservar rolagem interna, bloqueio do body, foco inicial/restaurado e fechamento por teclado; verificar em viewport pequeno que o conteúdo rola e o rodapé continua alcançável.
- [x] 2.3 Manter a linguagem visual do `DESIGN.md` e validar a composição em viewport mobile estreito e largo; verificar ausência de overflow horizontal, sobreposição com a barra flutuante e contagem legível.

## 3. URL, analytics e regressão

- [x] 3.1 Sincronizar URL e filtros aplicados somente ao confirmar o rascunho, mantendo busca rápida mobile, ordenação e reload/deep link compatíveis; verificar parâmetros e contagem após recarregar.
- [x] 3.2 Ajustar analytics para registrar aplicação, limpeza e cancelamento sem contar edições descartadas como filtros aplicados; verificar payloads e ausência de eventos duplicados.
- [x] 3.3 Executar typecheck, suíte de testes e build de produção; verificar que desktop, busca, chat, cards e filtros mobile continuam compilando sem regressões.

## Workflow follow-up

- Arquivar a mudança após a implementação e revisão visual satisfatórias.
- Validar o resultado arquivado e confirmar a atualização da especificação principal.
