# Sincronizacao com Google Sheets

O site ja tenta carregar os imoveis de uma planilha CSV. Por padrao ele usa
`public/properties.csv`, mas voce pode trocar para uma planilha publicada do
Google Sheets usando a variavel `VITE_PROPERTIES_SHEET_URL`.

## Como publicar a planilha

1. Crie uma planilha no Google Sheets com as colunas abaixo.
2. Va em `Arquivo > Compartilhar > Publicar na Web`.
3. Escolha a aba com os imoveis.
4. Publique como `CSV`.
5. Copie o link gerado.
6. Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_PROPERTIES_SHEET_URL=https://docs.google.com/spreadsheets/d/e/SEU_LINK/pub?output=csv
```

Depois reinicie o servidor do site.

## Colunas aceitas

```csv
id,title,type,category,region,price,description,long_description,available,bills_included,bedrooms,deposit,nearby_stations,lat,lng,furnishing,move_in_date,postcode,address,people,image,images,amenities,video
```

Campos com varias informacoes usam `|`, por exemplo:

```text
images: https://foto1.jpg|https://foto2.jpg|https://foto3.jpg
amenities: Bills inclusas|Wi-Fi|Mobiliado
nearby_stations: Dollis Hill|Neasden
```

Voce tambem pode colar links compartilhados do Google Drive nas colunas
`image` e `images`. Para varias imagens do Drive, separe os links com `|`:

```text
images: https://drive.google.com/file/d/ID_DA_FOTO_1/view?usp=sharing|https://drive.google.com/file/d/ID_DA_FOTO_2/view?usp=sharing
```

No Drive, deixe os arquivos com acesso para "qualquer pessoa com o link",
senão o navegador não consegue carregar as imagens no site.

Para o mapa funcionar melhor, preencha `lat` e `lng`. Se nao preencher, o site
tenta abrir pelo `address` + `postcode`.
