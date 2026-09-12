# Plano de Implementação: Projeto PocketJS Responsivo para Tablets e Múltiplas Proporções

Este plano adapta o projeto **PocketJS** com foco prioritário em **Tablets** (como os clássicos Galaxy Tab 7" `1024x600` e 10" `1280x800`, além de qualquer proporção moderna), garantindo que a aplicação seja **100% responsiva** em qualquer resolução e orientação (Landscape / Portrait), sem amarras a emuladores ou tamanhos fixos.

---

## 1. Descrição do Objetivo
* Projetar uma interface de páginas em **PocketJS / JSX** focada na experiência de **Tablet** (telas maiores, suporte a Master-Detail / Split View em orientação paisagem).
* Tornar o layout **totalmente fluido e adaptativo** para qualquer proporção de tela (4:3, 16:9, 16:10, 3:2, vertical ou horizontal).
* Implementar navegação reativa que adapte a estrutura:
  * Em **telas largas (landscape/tablets)**: visualização em colunas / painel dividido (Master-Detail).
  * Em **telas estreitas (portrait/compactas)**: visualização em pilha tradicional de páginas com transição fluida.
* Viewport flexível no `pocket.json` e ambiente de desenvolvimento limpo com redimensionamento dinâmico.

---

## 2. Decisões Técnicas & Design Responsivo

> [!IMPORTANT]
> **Layout Adaptativo (Tablet-First):**
> * Telas de tablets possuem espaço horizontal generoso. O roteador e os layouts principais adotarão um container adaptativo com detecção de largura (`viewportWidth > 640px` ou `isLandscape`).
> * Em modo tablet/amplo: Barra lateral (Sidebar/Navigation Rail) + Área de Conteúdo principal lado a lado.
> * Em modo compacto/retrato: Barra de navegação superior (Navbar) + Conteúdo empilhado.

> [!NOTE]
> **Proporções Suportadas:**
> * 7" Tablets: 1024x600 (WSVGA ~17:10)
> * 8.9" / 10.1" Tablets: 1280x800 (WXGA 16:10)
> * Tablets 4:3 (ex: 1024x768)
> * Redimensionamento livre em janela (desktop / web preview)

---

## 3. Arquitetura dos Arquivos

```
Kairo PJS 2/
├── package.json               # Dependências e scripts de desenvolvimento
├── tsconfig.json              # Configurações TypeScript e JSX
├── pocket.json                # Configuração PocketJS (redimensionável, fluid viewport)
├── index.html                 # Host dev responsivo (redimensionável livremente, sem bordas fixas)
└── src/
    ├── types.ts               # Tipos de dados, rotas e estado do viewport
    ├── viewport.ts            # Detecção de dimensões de tela e modo (Tablet vs Compacto)
    ├── router.tsx             # Roteador reativo com suporte a Split-View (Master-Detail)
    ├── index.tsx              # Ponto de entrada da aplicação
    ├── layout/
    │   ├── TabletLayout.tsx   # Layout em duas colunas (Sidebar + Conteúdo)
    │   └── MobileLayout.tsx   # Layout em coluna única para orientação retrato
    ├── components/            # Componentes reutilizáveis responsivos
    │   ├── Sidebar.tsx        # Menu lateral permanente para tablets
    │   ├── Topbar.tsx         # Cabeçalho com ações e indicador de rota
    │   ├── Card.tsx           # Cartão responsivo (se ajusta à largura da coluna)
    │   ├── Button.tsx         # Botão com toque otimizado para telas sensíveis
    │   └── Grid.tsx           # Container de grade fluida (1 a 3 colunas automáticas)
    └── pages/                 # Telas de conteúdo
        ├── Home.tsx           # Dashboard com métricas e cards em grid adaptativo
        ├── Details.tsx        # Página de dados detalhados / visualização mestre-detalhe
        └── Settings.tsx       # Configurações do app (ajustes de densidade e escala)
```

---

## 4. Detalhes de Implementação

### 4.1. `pocket.json`
Janela totalmente redimensionável, sem travar em dimensões estáticas:
```json
{
  "name": "kairo-pjs",
  "version": "1.0.0",
  "window": {
    "title": "Kairo Tablet App",
    "width": 1024,
    "height": 600,
    "minWidth": 320,
    "minHeight": 480,
    "resizable": true,
    "orientation": "any"
  },
  "targets": ["android", "web"]
}
```

### 4.2. Gerenciador de Viewport (`src/viewport.ts`)
Escuta mudanças de redimensionamento e orientação de tela em tempo real:
* `width()` e `height()`: dimensões atuais em pixels.
* `isTablet()`: `true` quando a largura for `>= 640px`.
* `isLandscape()`: `width > height`.

### 4.3. Roteador Adaptativo (`src/router.tsx`)
* Se `isTablet() && isLandscape()`: renderiza `<TabletLayout>`, onde a navegação de páginas pode carregar o conteúdo na coluna da direita preservando a lista à esquerda (Master-Detail).
* Se tela compacta: renderiza `<MobileLayout>` em página única com transição suave e botão de voltar.

---

## 5. Plano de Verificação

### Testes de Tipagem & Sintaxe
* Executar checagem de tipos:
  ```bash
  bun run typecheck # ou npx tsc --noEmit
  ```

### Verificação Manual de Responsividade
1. Iniciar o servidor local de desenvolvimento.
2. Testar em resoluções de tablet clássicas:
   * **1024x600** (Galaxy Tab 7"): verificar transição para layout de duas colunas com menu lateral.
   * **1280x800** (Tablet 10"): verificar distribuição do grid de conteúdo.
   * **Qualquer proporção arbitrária / Redimensionamento contínuo:** redimensionar a janela do navegador e checar se elementos fluem sem quebra ou scroll horizontal indesejado.
