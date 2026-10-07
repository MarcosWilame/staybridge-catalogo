# Design

## Context

O modelo atual usa campos úteis como `category`, `price`, `monthlyPrice`, `entryRent`, `people`, `moveInDate`, `amenities` e `billsIncluded`, mas parte das regras ainda é inferida de textos e há responsabilidades duplicadas entre o admin, a validação da API e as telas públicas.

## Goals / Non-Goals

**Goals:**

- Criar um contrato canônico compartilhado entre frontend, admin e API.
- Normalizar categorias, valores monetários, ocupação, disponibilidade e comodidades.
- Migrar registros legados com relatório de ambiguidades.
- Manter compatibilidade com os dados atuais durante a transição.

**Non-Goals:**

- Alterar banco, tabela ou autenticação sem necessidade técnica.
- Reescrever descrições editoriais ou remover informações não estruturadas.
- Mudar o layout visual da página além do necessário para consumir os campos.

## Decisions

1. **Um normalizador compartilhado no domínio**
   - Criar funções puras para converter entrada do admin, dados do Supabase e registros legados para o tipo canônico.
   - Alternativa rejeitada: manter regras separadas em cada tela, pois isso perpetua divergências.

2. **Valores monetários estruturados, com opções de ocupação**
   - Manter compatibilidade com `price`, `monthlyPrice` e `entryRent`, adicionando uma estrutura para múltiplos preços quando necessário.
   - Alternativa rejeitada: guardar todos os valores apenas em texto, pois filtros e SEO não conseguem interpretá-los de forma confiável.

3. **Disponibilidade com estado e data**
   - Usar estado derivado de `moveInDate` e publicação, preservando o texto de confirmação quando a data não for conhecida.
   - Alternativa rejeitada: usar somente `available: boolean`, que não diferencia imóvel futuro de imóvel a confirmar.

4. **Migração auditável e gradual**
   - Gerar relatório antes de persistir mudanças; aplicar automaticamente apenas conversões seguras e deixar ambiguidades para revisão no admin.
   - Alternativa rejeitada: migração destrutiva em lote, que pode transformar preços ou condições incorretamente.

## Risks / Trade-offs

- [Dados antigos inconsistentes] → gerar relatório de campos ambíguos e não sobrescrever o texto original.
- [Quebra de integrações] → manter aliases de leitura e adaptar gravação gradualmente.
- [Categorias fora do padrão] → exibir erro acionável no admin e registrar o valor recebido para correção.
- [Alterações em filtros] → cobrir normalizador e consultas com testes antes da migração.

## Migration Plan

1. Implementar o tipo canônico, normalizador e validações sem alterar registros existentes.
2. Executar leitura de todos os imóveis e gerar relatório de conversões e ambiguidades.
3. Corrigir ou confirmar os casos ambíguos no admin.
4. Persistir a normalização em lotes pequenos e verificar cards, filtros e detalhes.
5. Tornar o contrato obrigatório para novos cadastros.
6. Rollback: restaurar o backup dos registros e reativar os aliases de leitura caso a validação pós-migração falhe.
