# Bedminster London

Catalogo de acomodacoes em Londres com dados no Supabase, deploy na Netlify e metricas via GA4.

## Fonte De Dados

A fonte oficial dos imoveis e o Supabase.

- A area administrativa lista, cria, edita, oculta e remove os imoveis.
- A listagem publica `/unidades` carrega os imoveis por `/api/public-properties`.
- O arquivo `src/app/data/properties.ts` existe apenas como fallback de emergencia para desenvolvimento.
- Nao use `public/properties.json` ou planilhas como fonte paralela.

## Variaveis De Ambiente

Configure na Netlify em `Project configuration > Environment variables`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PROPERTIES_TABLE=properties
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`SUPABASE_SERVICE_ROLE_KEY` e privada. Use somente em ambiente de servidor, como Netlify Functions.

## Banco

A tabela esperada no Supabase e `properties`, com:

- `id`: inteiro
- `data`: jsonb com o imovel completo

O campo `listed` controla se o imovel aparece no site publico. Imoveis ocultos continuam disponiveis na area administrativa.

## Desenvolvimento

```bash
npm install
npm run dev
```

Validacao antes de deploy:

```bash
npx tsc --noEmit
npm run build
```

## Deploy

O projeto esta preparado para Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Function publica: `netlify/functions/public-properties.js`
- Redirect SPA/API: `public/_redirects`

Depois de mudar variaveis de ambiente na Netlify, rode `Trigger deploy > Deploy site`.

## Rotas

- `/`: inicial
- `/unidades`: listagem publica
- `/properties`: alias legado da listagem
- `/property/:id`: detalhe do imovel
- `/favorites`: favoritos
- `/profile`: area do cliente

## Metricas

O GA4 e carregado com o ID `G-J6HK0DQQ11` e eventos adicionais sao enviados por `src/app/utils/analytics.ts`.

Eventos principais:

- `page_view`
- `whatsapp_click`
- `view_units_click`
- `property_details_click`
- `property_category_click`
- `property_favorite_add`
- `property_favorite_remove`
- `property_map_click`
- `social_click`
