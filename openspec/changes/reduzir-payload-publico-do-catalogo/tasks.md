# Tasks

## 1. Contrato público e limites

- [x] 1.1 Definir constantes de limites e uma allowlist explícita em `api/public-property-fields.js`, removendo campos públicos sem consumidor (`sourceText` e `entryConditions`) e preservando os campos usados pelo catálogo, incluindo `deposit`; verificar a chave exata do objeto com teste de contrato.
- [x] 1.2 Aplicar limites de descrição, long description, imagens, estações e opções de preço após sanitização de URLs e valores; verificar truncamento determinístico, fallback da imagem principal e rejeição de mídia insegura.
- [x] 1.3 Atualizar os testes públicos existentes para refletir o contrato reduzido e documentar no próprio teste quais campos sustentam listagem, busca, cards, detalhes, SEO e compartilhamento; verificar que campos administrativos continuam ausentes.

## 2. Medição e compatibilidade

- [x] 2.1 Criar fixture representativo com textos e coleções acima dos limites, dados desconhecidos e mídias mistas; verificar que o JSON normalizado é menor que a baseline anterior e que os campos essenciais permanecem.
- [x] 2.2 Verificar que o endpoint público e o cache continuam compatíveis com a resposta reduzida, sem alterar o formato interno nem introduzir dados de imóvel em analytics; validar o caminho de carregamento usado por `useProperties`.

## 3. Integração

- [x] 3.1 Executar typecheck, suíte completa de testes e build de produção; verificar que listagem, busca, chat, cards, mapa, detalhes, galeria e SEO continuam compilando e cobertos sem regressões.
- [x] 3.2 Revisar o diff e a métrica de payload antes da publicação; verificar que somente arquivos da mudança foram alterados e registrar o tamanho antes/depois no resultado da validação.

## Workflow follow-up

- Arquivar a mudança após a implementação e revisão satisfatórias.
- Validar o resultado arquivado e confirmar a atualização da especificação principal.
