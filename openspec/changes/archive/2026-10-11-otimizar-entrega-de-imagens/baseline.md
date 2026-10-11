# Image Delivery Baseline

Data da medição: 2026-10-11

## Estado observado antes da implementação

- Cards: variante Cloudinary `720x520`, `sizes` responsivo, dois primeiros cards com `eager`/prioridade alta.
- Detalhes: variante `1200x760`, mídia ativa com prioridade alta e pré-carregamento antecipado das quatro primeiras imagens.
- Miniaturas: variante `240x180`.
- Payload público: até 10 imagens, mas a mesma URL podia aparecer mais de uma vez entre capa e galeria.
- Fallback: componente compartilhado com imagem substituta e texto alternativo contextual.
- Medição de bytes por imagem e Core Web Vitals: não disponível no navegador embutido deste ambiente, que retorna timeout para o servidor Vite local.

## Método reproduzível

1. Executar `npm run dev -- --host 127.0.0.1`.
2. Medir catálogo e detalhe em viewport mobile estreito e desktop com cache frio e quente.
3. Registrar apenas bytes transferidos, duração, status, variante e contagem de imagens; não registrar URL completa, endereço ou busca.
4. Comparar com o mesmo fluxo após a implementação.

O baseline estático acima fixa os comportamentos e limites que serão comparados nos testes automatizados enquanto a medição de rede real permanece dependente de um navegador acessível.

## Baseline online observado

Página de detalhe em viewport mobile, sem as mudanças locais de entrega:

| Condição | Requests | Transferido | Recursos | Finish |
| --- | ---: | ---: | ---: | ---: |
| Cache frio | 3/29 | 378 KB | 3.477 MB | 2.58 s |
| Cache quente | 3/29 | 0 KB | 2.587 MB | 841 ms |

A imagem principal carregou com status 200 e aproximadamente 253 KB nas duas medições. Não houve falha de imagem nesse baseline online.

## Resultado pós-implementação

Build atual servido por `vite preview`, na mesma página e viewport:

| Condição | Requests | Transferido | Recursos | Finish |
| --- | ---: | ---: | ---: | ---: |
| Cache frio | 3/19 | 378 KB | 830 KB | 1,45 s |
| Cache quente | 3/18 | 0,2 KB | 36 KB | 949 ms |

Comparação observada:

- Cache frio: recursos reduziram de 3.477 MB para 830 KB, aproximadamente 76% menos; o tempo caiu de 2,58 s para 1,45 s, aproximadamente 44% menos.
- Cache quente: recursos reduziram de 2.587 MB para 36 KB; o tempo ficou próximo, 841 ms contra 949 ms.
- A imagem principal continuou carregando com status 200 e aproximadamente 253 KB.

O baseline foi medido no servidor online e o resultado em `vite preview` local; portanto a comparação confirma a redução estrutural de recursos e requests, mas não substitui uma medição final no mesmo ambiente de produção após o deploy.
