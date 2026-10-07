# Spec Delta

## Purpose

Define um contrato previsível para os dados de cada imóvel, permitindo que cadastro, filtros, detalhes, SEO e integrações exibam as mesmas informações sem depender de interpretação de texto livre.

## ADDED Requirements

### Requirement: Property identity fields use a consistent vocabulary
O sistema SHALL armazenar categoria, tipo, título, endereço, postcode, região e área local em campos separados, com categorias válidas e valores textuais normalizados.

#### Scenario: Valid property identity is accepted
- **WHEN** um imóvel é criado com categoria `single`, `double`, `ensuite`, `studio` ou `flat`
- **THEN** o sistema preserva a categoria, normaliza o postcode e mantém endereço, região e área local em campos próprios

#### Scenario: Unsupported category is rejected or mapped
- **WHEN** o cadastro recebe uma categoria fora do vocabulário definido
- **THEN** o sistema não grava uma nova variação silenciosa e retorna erro de validação ou aplica um mapeamento explícito

### Requirement: Pricing and entry conditions are structured
O sistema SHALL representar preço semanal, preço mensal, depósito e aluguel inicial como valores identificáveis separadamente, sem exigir a leitura de `description` ou `longDescription`.

#### Scenario: Weekly-only property
- **WHEN** o anúncio informa apenas aluguel semanal
- **THEN** o preço semanal é preenchido e os valores mensal, depósito ou entrada permanecem ausentes ou explicitamente marcados como a confirmar

#### Scenario: Property has multiple price options
- **WHEN** o anúncio possui valores diferentes por ocupação ou periodicidade
- **THEN** cada opção é registrada com seu valor, periodicidade e condição de ocupação, sem sobrescrever outra opção

### Requirement: Occupancy and physical configuration are deterministic
O sistema SHALL separar quantidade máxima de moradores, quartos, banheiros e tipo de unidade, aplicando até 2 moradores automaticamente para `ensuite`, `studio` e `double` quando o cadastro não informar outra regra permitida.

#### Scenario: Standard room category
- **WHEN** um imóvel `ensuite`, `studio` ou `double` é salvo sem capacidade explícita
- **THEN** `people` é normalizado para 2 e a interface apresenta “Até 2 moradores”

#### Scenario: Flat configuration
- **WHEN** um `flat` é cadastrado com número de quartos e capacidade
- **THEN** quartos e moradores são preservados em campos numéricos independentes

### Requirement: Bills, amenities and availability are machine-readable
O sistema SHALL representar bills, comodidades, data de entrada e estado de publicação em campos próprios, distinguindo disponibilidade imediata, data futura e disponibilidade a confirmar.

#### Scenario: Immediate availability
- **WHEN** o cadastro informa “Disponível agora”
- **THEN** o imóvel é tratado como disponível imediatamente e exibe o rótulo correspondente

#### Scenario: Future or unconfirmed availability
- **WHEN** o cadastro informa uma data futura ou “consulte com um de nossos agentes”
- **THEN** a interface exibe a informação correspondente sem convertê-la em disponibilidade imediata

### Requirement: Legacy values are normalized without losing source information
O sistema SHALL converter formatos antigos conhecidos para o contrato padronizado e preservar o texto original quando uma informação não puder ser convertida com segurança.

#### Scenario: Legacy free-text price
- **WHEN** um imóvel antigo possui preço no formato “£250 por semana”
- **THEN** o sistema extrai o valor semanal e mantém o texto original disponível para revisão

#### Scenario: Ambiguous legacy value
- **WHEN** um texto contém múltiplos valores sem identificar claramente sua condição
- **THEN** o sistema não inventa uma interpretação e marca o campo para confirmação administrativa

### Requirement: Admin validation prevents new field drift
O sistema SHALL validar o contrato padronizado antes de persistir um imóvel e SHALL apresentar erros específicos para campos obrigatórios, valores inválidos e combinações incompatíveis.

#### Scenario: Invalid numeric field
- **WHEN** preço, quartos, banheiros, depósito ou moradores recebem texto inválido ou número fora do limite
- **THEN** o cadastro é bloqueado e o administrador recebe uma mensagem indicando o campo incorreto

#### Scenario: Validated property reaches public views
- **WHEN** um imóvel passa pela validação
- **THEN** cards, filtros, página de detalhes e SEO consomem os mesmos campos normalizados
