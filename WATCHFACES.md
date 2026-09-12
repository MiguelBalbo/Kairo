# Formato de Watchface — Kairo PJS 2

Uma watchface é um arquivo `.json` que descreve o que aparece no card do relógio da
tela inicial. Ela **não** afeta o card de clima/próximos eventos ao lado — só o
próprio relógio.

O formato é inspirado no princípio declarativo do [Watch Face Format](https://developer.android.com/training/wearables/wff)
do Wear OS (uma lista de elementos, sem código), adaptado para um schema JSON simples
que roda neste app.

## Estrutura

```json
{
  "name": "Nome da Watchface",
  "elements": [ /* lista de elementos, de cima para baixo */ ]
}
```

- `name` (obrigatório): nome exibido em Configurações > Watchfaces.
- `elements` (obrigatório, não pode ser vazio): lista de elementos empilhados verticalmente dentro do mesmo card que hoje mostra o relógio.

Ao importar, um `id` único é gerado automaticamente — não é preciso (nem deve) incluir `id` no arquivo.

## Tipos de elemento

Todos os elementos de texto (`time-text`, `date-text`, `label-text`) aceitam estas propriedades de estilo, além das específicas listadas abaixo:

| Propriedade | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `fontSize` | string CSS (aceita `clamp()`) | sim | Tamanho em telas de tablet (≥640px) |
| `fontSizeMobile` | string CSS | sim | Tamanho em telas menores |
| `fontWeight` | `100`\|`200`\|`300`\|`400` | não (padrão `200`) | Peso da fonte Archivo |
| `letterSpacing` | string CSS | não | Ex: `"-0.02em"` |
| `lineHeight` | string CSS | não | Ex: `"1.1"` |
| `marginTop` / `marginTopMobile` | string CSS | não | Espaço acima do elemento |
| `opacity` | número 0-1 | não | Opacidade do texto |
| `uppercase` | boolean | não | Força maiúsculas |

### `time-text`
Mostra a hora atual, atualizada a cada segundo.
- `format` (obrigatório): string com os tokens `HH` (24h com zero à esquerda), `h` (12h sem zero), `mm` (minutos), `ss` (segundos), `a`/`A` (am/pm minúsculo/maiúsculo). Ex.: `"HH:mm"`, `"h:mm a"`, `"HH:mm:ss"`.

### `date-text`
Mostra a data atual, em português.
- `style` (obrigatório): `"long"` (ex. "sexta-feira, 11 de setembro de 2026") ou `"short"` (ex. "Sex, 11/09").

### `label-text`
Texto estático livre.
- `text` (obrigatório): o texto a exibir.

### `divider`
Linha fina horizontal, sem propriedades de texto.
- `marginTop` (opcional): espaço acima da linha.

### `analog-clock`
Relógio de ponteiros desenhado em SVG.
- `diameter` / `diameterMobile` (obrigatórios): tamanho em CSS (ex. `"clamp(200px, 32vw, 340px)"`).
- `showSeconds` (opcional): mostra o ponteiro de segundos.
- `tickMarks` (opcional): mostra as 12 marcações de hora.
- `marginTop` (opcional).

### `digit-cells`
Cada caractere do horário formatado numa caixinha própria (estética "flip clock").
- `format` (obrigatório): mesmos tokens de `time-text`.
- `fontSize` / `fontSizeMobile` (obrigatórios).
- `marginTop` (opcional).

## Exemplo completo

```json
{
  "name": "Relógio de Bolso",
  "elements": [
    {
      "type": "analog-clock",
      "diameter": "clamp(200px, 32vw, 340px)",
      "diameterMobile": "clamp(160px, 55vw, 240px)",
      "showSeconds": true,
      "tickMarks": true
    },
    {
      "type": "date-text",
      "style": "long",
      "fontWeight": 200,
      "fontSize": "1.5rem",
      "fontSizeMobile": "1.1rem",
      "marginTop": "1.5rem",
      "opacity": 0.9
    },
    {
      "type": "label-text",
      "text": "Kairo",
      "fontWeight": 300,
      "fontSize": "0.85rem",
      "fontSizeMobile": "0.75rem",
      "marginTop": "0.5rem",
      "opacity": 0.5,
      "uppercase": true,
      "letterSpacing": "0.15em"
    }
  ]
}
```

Salve como `.json` e importe em **Configurações > Watchfaces > Importar Watchface**.
