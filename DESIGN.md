---
name: Staybridge London
description: Catálogo imobiliário premium e objetivo para encontrar imóveis em Londres.
colors:
  evergreen: "#1a4d2e"
  evergreen-medium: "#2d5a3d"
  signal-yellow: "#f4d03f"
  signal-yellow-dark: "#d4b034"
  paper-warm: "#f7f4df"
  surface-white: "#ffffff"
  text-black: "#0a0a0a"
  text-muted: "#666666"
  border-soft: "rgba(26, 77, 46, 0.16)"
  whatsapp: "#25d366"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.35rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.text-black}"
    typography: "700 1rem/1.5 system-ui, sans-serif"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  button-secondary:
    backgroundColor: "{colors.evergreen}"
    textColor: "{colors.surface-white}"
    typography: "700 1rem/1.5 system-ui, sans-serif"
    rounded: "{rounded.md}"
    padding: "0.75rem 1.5rem"
  card:
    backgroundColor: "rgba(255, 255, 255, 0.78)"
    textColor: "{colors.text-black}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"

---

# Design System: Staybridge London

## Overview

**Creative North Star: "Atendimento premium sem complicação"**

Staybridge London deve transmitir segurança e cuidado sem parecer burocrático. A experiência combina a confiança de uma imobiliária local com a velocidade de um catálogo digital: informações essenciais aparecem primeiro, os caminhos são diretos e cada ação importante tem um próximo passo claro.

O sistema atual usa uma base verde profunda, sinais amarelos e superfícies claras para criar contraste e reconhecimento. A evolução da identidade deve reforçar uma linguagem londrina, profissional e inclusiva para qualquer pessoa procurando imóvel em Londres, sem depender de uma estética genérica ou de códigos visuais exclusivamente brasileiros.

**Key Characteristics:**
- Premium, mas acessível.
- Objetivo e fácil de escanear.
- Confiável sem excesso de formalidade.
- Superfícies claras com acentos de marca controlados.
- Mobile-first e orientado à conversão.

## Colors

A paleta combina um verde londrino profundo com um amarelo de ação sobre fundos claros e quentes. O amarelo deve funcionar como sinal de interação, não como preenchimento dominante da interface.

### Primary
- **London Evergreen** (#1a4d2e): navegação, ações de confiança, títulos de marca e estados ativos.
- **Evergreen Medium** (#2d5a3d): variações de superfície, navegação mobile e profundidade de marca.

### Secondary
- **Warm Signal Yellow** (#f4d03f): CTAs principais, seleção de idioma, destaques e indicadores de ação.
- **Warm Signal Deep** (#d4b034): hover e estados de interação do amarelo.

### Neutral
- **Warm Paper** (#f7f4df): fundos de páginas e áreas de respiro.
- **Surface White** (#ffffff): cards, painéis e conteúdo principal.
- **Ink Black** (#0a0a0a): texto de alta prioridade.
- **Muted Graphite** (#666666): descrições e metadados.
- **Soft Evergreen Border** (rgba(26, 77, 46, 0.16)): divisórias e contornos discretos.

### Named Rules
**The Signal Yellow Rule.** O amarelo é reservado para indicar ação, seleção ou oportunidade; não deve virar a cor estrutural de grandes áreas.

## Typography

**Display Font:** system-ui (with sans-serif)
**Body Font:** system-ui (with sans-serif)
**Label/Mono Font:** system-ui (with sans-serif)

**Character:** A tipografia é neutra, clara e funcional. O peso cria hierarquia e confiança, enquanto o espaçamento mantém a leitura rápida em páginas densas de imóveis.

### Hierarchy
- **Display** (700, clamp(2rem, 5vw, 4rem), 1.1): mensagens principais e hero.
- **Headline** (700, clamp(1.5rem, 3vw, 2.5rem), 1.2): títulos de seção e páginas.
- **Title** (700, 1.25rem, 1.35): nomes de imóveis e grupos de informação.
- **Body** (400, 1rem, 1.5): descrições, instruções e conteúdo de apoio.
- **Label** (700, 0.75rem, 0.04em): badges, metadados e pequenos rótulos de contexto.

## Layout

O layout usa um container central com gutters responsivos, grid de cards e composição em duas colunas quando há espaço suficiente. No mobile, o conteúdo deve colapsar em uma coluna, preservar CTAs acessíveis e priorizar imagem, preço, localização e disponibilidade.

O ritmo espacial é baseado em múltiplos de 8px, com blocos de conteúdo separados por respiro generoso. Galerias e imagens devem ocupar espaço real; evitar reduzir fotografias importantes a miniaturas decorativas.

## Elevation & Depth

O sistema usa uma combinação de camadas tonais, bordas translúcidas e sombras verdes difusas. A profundidade é suave e premium, não dramática. O efeito glass deve reforçar a separação entre superfícies, sem prejudicar contraste ou legibilidade.

### Shadow Vocabulary
- **Ambient:** `0 16px 42px rgba(26, 77, 46, 0.12)` para cards e painéis em repouso.
- **Elevated:** `0 22px 58px rgba(26, 77, 46, 0.18)` para áreas de maior prioridade.
- **Brand Glow:** `0 22px 70px rgba(26, 77, 46, 0.16)` para mídia e blocos premium.

### Named Rules
**The Calm Depth Rule.** Sombras devem criar separação e foco, nunca fazer cada card parecer flutuar de forma exagerada.

## Shapes

As formas são arredondadas e acolhedoras, com cards grandes em torno de 1.35rem, controles médios em 0.75rem e badges em formato pill. Bordas são finas, suaves e preferencialmente verdes translúcidas. Imagens e galerias devem respeitar clipping consistente com o container.

## Components

### Buttons
- **Shape:** arredondado médio (0.75rem), com altura confortável para toque.
- **Primary:** amarelo de sinal com texto escuro, peso forte e sombra discreta.
- **Hover / Focus:** elevação curta, mudança para amarelo profundo e foco visível amarelo com halo verde.
- **Secondary:** verde evergreen com texto branco; usar para ações de confiança e contato.

### Chips
- **Style:** formato pill, preenchimento verde muito claro ou branco translúcido, texto evergreen.
- **State:** o estado selecionado usa evergreen ou amarelo, mantendo contraste alto.

### Cards / Containers
- **Corner Style:** arredondamento generoso (1.35rem) para cards de catálogo e painéis principais.
- **Background:** branco translúcido sobre fundos quentes ou branco sólido quando a legibilidade for prioridade.
- **Shadow Strategy:** sombra ambient em repouso; elevação maior somente em hover ou prioridade.
- **Border:** linha evergreen translúcida.
- **Internal Padding:** escala de 1rem a 1.5rem, aumentando em painéis de destaque.

### Inputs / Fields
- **Style:** superfície clara, borda suave e raio médio.
- **Focus:** contorno amarelo com halo evergreen, sempre visível no teclado.
- **Error / Disabled:** erro em vermelho claro com mensagem objetiva; estados desabilitados devem reduzir contraste sem parecer quebrados.

### Navigation
- **Style:** header evergreen fixo, logo claro, links compactos e CTA amarelo de alta visibilidade.
- **Default / Hover / Active:** texto branco no repouso, amarelo no hover e fundo translúcido no estado ativo.
- **Mobile:** menu vertical simples, linguagem e CTA preservados sem competir com o conteúdo.

### Property Gallery
Galeria é uma assinatura do produto: uma imagem principal grande, imagens secundárias organizadas, contador e acesso claro à experiência completa. No mobile, a prioridade é swipe/carrossel com indicador de posição.

## Do's and Don'ts

### Do:
- **Do** priorizar preço, localização, disponibilidade e tipo de imóvel no primeiro escaneamento.
- **Do** usar o verde para confiança e o amarelo para ação.
- **Do** manter textos curtos, específicos e orientados ao próximo passo.
- **Do** usar fotografias grandes e com boa proporção.
- **Do** preservar foco visível e alvos confortáveis para toque.

### Don't:
- **Don't** criar telas com aparência de template imobiliário genérico.
- **Don't** usar amarelo em grandes áreas sem função de ação.
- **Don't** esconder preço, disponibilidade ou condições de entrada em textos longos.
- **Don't** empilhar sombras e efeitos glass a ponto de reduzir contraste.
- **Don't** usar frases vagas, promessas não confirmadas ou excesso de texto.
