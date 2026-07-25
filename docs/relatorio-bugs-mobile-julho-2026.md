# Relatório Técnico — Correção de Bugs Mobile
## MediaGeek AI — SaaS Platform
**Data:** Julho de 2026  
**Ambiente:** Next.js 14 / Tailwind CSS / Framer Motion / Hostinger VPS  
**Escopo:** Responsividade mobile completa — layout, scroll, animações, touch

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Bug #1 — Overflow Horizontal (conteúdo deslocado à direita)](#bug-1)
3. [Bug #2 — Flash / Conteúdo Sumindo ao Scrollar](#bug-2)
4. [Bug #3 — Hero da Landing Page Desaparecendo no Scroll](#bug-3)
5. [Bug #4 — "Dançando ao Toque" (layout oscilando no touch)](#bug-4)
6. [Bug #5 — Texto Longitudinal no Grammar Check](#bug-5)
7. [Bug #6 — Ícone "Tic-Tac" (formato oval)](#bug-6)
8. [Bug #7 — Títulos Quebrando o Layout em Mobile](#bug-7)
9. [Bug #8 — Grid de Dois Colunas Comprimindo em Mobile](#bug-8)
10. [Resumo das Lições Aprendidas](#lições-aprendidas)
11. [Checklist para Novos Componentes](#checklist)

---

## Visão Geral

Durante testes intensivos em dispositivo mobile real (Android/Chrome), foram identificados **8 categorias de bugs** distintos que afetavam a experiência do usuário em todas as páginas do SaaS. Todos os bugs foram corrigidos e deployados com sucesso. Este documento descreve cada bug em detalhe — sua causa raiz, por que acontece e como foi corrigido — para servir de guia de aprendizado e prevenção futura.

---

## Bug #1 — Overflow Horizontal (conteúdo deslocado à direita) {#bug-1}

### Sintoma
O conteúdo aparecia deslocado para a direita em mobile. A página tinha scroll horizontal indesejado, fazendo o usuário enxergar apenas parte do conteúdo.

### Ferramentas afetadas
Todas as páginas de ferramentas (ToolPage), HeadlineGenerator, InstagramCaptionGenerator e diversas views.

### Causa Raiz

**Problema A — Classe `container` do Tailwind com padding duplo**

A classe `container` do Tailwind tem configuração personalizada no projeto:
```js
// tailwind.config.js
container: {
  padding: "2rem"  // 32px de cada lado
}
```

O `Layout.tsx` já adiciona `p-4 lg:p-6 xl:p-8` (16px mobile). Quando um componente dentro do Layout usava `container max-w-5xl`, o resultado era:
- Layout: 16px de padding
- Container: 32px de padding
- **Total: 48px de cada lado em mobile** — conteúdo comprimido demais e ultrapassando a tela

**Problema B — Transforms do Framer Motion (`x: ±20`)**

Animações de entrada com deslocamento horizontal:
```jsx
// ERRADO — causa overflow durante a animação
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
```
Durante a transição de `x: -20` para `x: 0`, o elemento renderiza 20px fora dos limites da tela. Sem `overflow: hidden` efetivo no body, isso cria scroll horizontal.

**Problema C — `overflow-x: clip` sem suporte universal**

O CSS `overflow-x: clip` foi usado para bloquear scroll horizontal, mas navegadores mais antigos fazem fallback para `visible` (sem nenhum bloqueio), tornando a correção ineficaz.

### Solução

```css
/* globals.css — mobile */
@media (max-width: 1023px) {
  body {
    overflow-x: hidden !important; /* spec CSS: força overflow-y: auto no body */
  }
}
```

```jsx
// CORRETO — substituir container por classes explícitas
// Antes:
<div className="container max-w-5xl">

// Depois:
<div className="w-full max-w-5xl mx-auto">
```

```jsx
// CORRETO — animações apenas com opacity em mobile
// Antes:
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}

// Depois:
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
```

### Regra para a Equipe
> **Nunca use a classe `container` do Tailwind dentro de componentes que já estão dentro do `Layout`.** Use `w-full max-w-[X] mx-auto` no lugar. Nunca use `x:` ou `y:` em animações Framer Motion em páginas mobile — use apenas `opacity`.

---

## Bug #2 — Flash / Conteúdo Sumindo ao Scrollar {#bug-2}

### Sintoma
Ao scrollar a página em mobile, o conteúdo piscava, desaparecia momentaneamente ou havia um "flash" branco. Relatado em todas as páginas autenticadas (dashboard e ferramentas).

### Causa Raiz

O `Layout.tsx` tinha três elementos decorativos com `position: fixed` e `filter: blur(80px)`:

```jsx
<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px]" />
  <div className="absolute bottom-0 left-0 w-80 h-80 bg-ai-secondary/5 rounded-full blur-[80px]" />
  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-ai-tertiary/5 rounded-full blur-[80px]" />
</div>
```

**Por que isso causa flash:** `position: fixed` + `filter: blur()` forçam a criação de uma nova **GPU compositing layer**. A cada frame de scroll em mobile, o browser precisa:
1. Recalcular a posição do elemento fixed
2. Re-renderizar o blur na GPU
3. Compositar com o conteúdo da página

Em mobile, esse processo é lento o suficiente para causar frames perdidos, que aparecem como flashes brancos ou momentos em que a página parece "tremer".

### Solução

```jsx
// Ocultar os orbs no mobile — efeito só em desktop
<div className="hidden lg:block fixed inset-0 -z-10 overflow-hidden pointer-events-none">
```

O mesmo problema existia na LandingPage com os blobs de background decorativos.

### Regra para a Equipe
> **Nunca use `position: fixed` + `filter: blur()` em elementos visíveis no mobile.** O custo de GPU é alto demais. Se quiser efeitos de glow/blur decorativos, use `hidden lg:block` para limitar ao desktop, ou use elementos `position: absolute` que não precisam ser recalculados a cada frame de scroll.

---

## Bug #3 — Hero da Landing Page Desaparecendo no Scroll {#bug-3}

### Sintoma
Ao scrollar a home page (landing page), o conteúdo do hero (título, subtítulo, botões, estatísticas) desaparecia completamente. No lugar ficava um espaço branco enorme antes das seções seguintes (brands, features). O conteúdo voltava ao scrollar de volta ao topo.

### Causa Raiz

O container principal do hero tinha um **efeito de parallax scroll-driven** usando o Framer Motion:

```jsx
// LandingPage.tsx — CÓDIGO PROBLEMÁTICO
const { scrollY } = useScroll();
const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
const heroScale  = useTransform(scrollY, [0, 300], [1, 0.95]);

// Hero section
<motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
  {/* Todo o conteúdo do hero */}
</motion.div>
```

**Por que é destrutivo em mobile:** Em desktop (tela de 1440px), 300px de scroll representa cerca de 20% da altura da viewport — o usuário mal começou a scrollar e o hero ainda está visível. Em mobile (tela de 812px), 300px de scroll é quase 37% da altura — o hero ainda está completamente na tela mas já está com `opacity: 0`.

O elemento DOM continua existindo (com seu height natural), mas completamente transparente. Isso explica:
- O gap branco enorme (é o hero, invisível mas presente no DOM)
- O conteúdo "desaparecendo" ao scrollar

### Solução

```jsx
// Remover o motion.div e o style scroll-driven
// Antes:
<motion.div style={{ opacity: heroOpacity, scale: heroScale }}
  className="container mx-auto px-4 text-center relative z-10">

// Depois — div simples, sempre visível:
<div className="container mx-auto px-4 text-center relative z-10">
```

As animações de entrada dos filhos (`animate={{ opacity: 1 }}`) continuam funcionando normalmente.

### Regra para a Equipe
> **Efeitos de parallax e scroll-driven opacity são perigosos em mobile.** Se for usar `useTransform(scrollY, ...)`, sempre calcule se o range faz sentido para telas menores. Uma regra segura: o range de fade deve ser **maior que a altura da viewport mobile** (> 812px). Ou simplesmente desative em mobile com `const isMobile = useMediaQuery('(max-width: 1023px)')`.

---

## Bug #4 — "Dançando ao Toque" (layout oscilando no touch) {#bug-4}

### Sintoma
Ao tocar a tela em qualquer ferramenta, o layout inteiro "dançava" — oscilava horizontalmente. Reportado especialmente no Poem Generator, Paraphraser, Tone Converter e Grammar Check.

### Causa Raiz — Dupla

**Causa A — `overflow-auto` em containers de output criando eixo horizontal**

Todos os containers de output de resultado de IA tinham:
```jsx
<div className="flex-1 min-h-[250px] border rounded-md p-4 bg-background overflow-auto">
  <MarkdownRenderer content={result} />
</div>
```

O `overflow: auto` cria uma **scroll region** independente. Em iOS/Android, quando o usuário toca e arrasta com um leve componente horizontal no gesto, o browser tenta fazer scroll nesse container. O efeito visual é o conteúdo da página "saltando" para o lado.

**Causa B — Falta de `touch-action: pan-y`**

Sem essa declaração CSS, o browser não sabe que a página só deve responder a movimentos verticais. Qualquer gesto de toque com componente X causa tentativa de scroll horizontal.

### Solução

```css
/* globals.css — mobile */
@media (max-width: 1023px) {
  body {
    touch-action: pan-y; /* Só aceita panning vertical */
  }
}
```

```jsx
// Em TODOS os containers de output — trocado em 10+ views
// Antes:
<div className="... overflow-auto">

// Depois:
<div className="... overflow-y-auto overflow-x-hidden">
```

Arquivos corrigidos: `GrammarPage`, `TranslatorPage`, `EmailPage`, `RecipePage`, `SQLPage`, `StoryPage`, `WriterPage`, `SummarizerPage`, `FinancePage`, `OCRPage`, `ToolPage`.

### Regra para a Equipe
> **Nunca use `overflow: auto` em containers de output de texto em mobile.** Use sempre `overflow-y-auto overflow-x-hidden`. Isso garante que o usuário pode scrollar o resultado verticalmente mas não cria um eixo horizontal que interfere com o gesto de scroll da página.

---

## Bug #5 — Texto Longitudinal no Grammar Check {#bug-5}

### Sintoma
Um texto de exemplo ("I am writing this email to inform...") aparecia completamente horizontal, sem quebrar linha, fazendo o layout inteiro se deslocar para a direita conforme a frase avançava.

### Causa Raiz

Os botões de exemplo tinham `w-full` mas mostravam o texto completo do exemplo sem truncar:

```jsx
// GrammarPage.tsx — CÓDIGO PROBLEMÁTICO
{exampleTexts.slice(0, 2).map((example) => (
  <Button className="w-full text-left justify-start text-xs h-auto p-2">
    {example}  {/* Texto completo: "I am writing this email to inform you..." */}
  </Button>
))}
```

O `w-full` funciona bem para texto curto. Mas um exemplo com 80+ caracteres em um botão com `h-auto` em um container com `overflow: auto` cria uma linha horizontal que excede a largura da tela.

### Solução

```jsx
// Truncar o texto de exemplo + esconder overflow do botão
<Button className="w-full text-left justify-start text-xs h-auto p-2 overflow-hidden">
  {example.length > 60 ? example.slice(0, 60) + '...' : example}
</Button>
```

```jsx
// Título responsivo
// Antes:
<h1 className="text-3xl font-bold ai-gradient-text">

// Depois:
<h1 className="text-xl lg:text-3xl font-bold ai-gradient-text">
```

### Regra para a Equipe
> **Nunca renderize texto dinâmico de comprimento desconhecido em botões sem truncar.** Use `truncate` (CSS `text-overflow: ellipsis`) ou limite os caracteres via JS. Em mobile, um texto longo em um botão `w-full` pode ultrapassar a largura da tela se o container pai tiver `overflow: visible`.

---

## Bug #6 — Ícone "Tic-Tac" (formato oval) {#bug-6}

### Sintoma
O ícone no cabeçalho de todas as ferramentas aparecia em formato oval (mais alto que largo) em mobile, em vez de quadrado.

### Causa Raiz

O wrapper do ícone estava dentro de um container `flex` sem `shrink-0`:

```jsx
// ToolPage.tsx — CÓDIGO PROBLEMÁTICO
<div className="flex items-center gap-4">
  <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
    {/* ícone */}
  </div>
  <div>
    <h1 className="text-3xl font-bold">{title}</h1>
    {/* ... */}
  </div>
</div>
```

**Por que fica oval:** Em `display: flex`, os filhos podem ser comprimidos pelo algoritmo flexbox. O título `text-3xl` é muito largo para mobile → flex tenta acomodar comprimindo o ícone → a **largura** (flex axis) é comprimida mas a **altura** (`h-14 = 56px`, fixada por CSS) não muda → resultado oval.

### Solução

```jsx
// ToolPage.tsx — CORRETO
<div className="flex items-center gap-3">
  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0">
    {/* shrink-0 = nunca comprima este elemento */}
  </div>
  <div className="min-w-0">  {/* min-w-0 permite que o texto quebre linha */}
    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{title}</h1>
  </div>
</div>
```

### Regra para a Equipe
> **Sempre adicione `shrink-0` em elementos com dimensões fixas (`w-X h-X`) dentro de containers `flex`.** Sem isso, o flexbox pode comprimir a largura do elemento enquanto mantém a altura, criando formas deformadas. Adicione também `min-w-0` no irmão de texto para que ele possa quebrar linha corretamente.

---

## Bug #7 — Títulos Quebrando o Layout em Mobile {#bug-7}

### Sintoma
Títulos `text-3xl` e `text-4xl` fixos em páginas customizadas causavam layout overflow ou comprimiam outros elementos adjacentes em mobile.

### Causa Raiz

Views customizadas (não via ToolPage) tinham títulos com tamanho fixo independente da tela:

```jsx
// PROBLEMÁTICO — mesmo tamanho em qualquer tela
<h1 className="text-3xl font-bold">AI Grammar Check</h1>
<h1 className="text-4xl font-bold">Caption Generator</h1>
```

`text-3xl` = 30px, `text-4xl` = 36px. Em mobile com tela de 375px, um título de 36px com texto longo pode ultrapassar a linha e forçar reflow.

### Solução — Títulos Responsivos

```jsx
// CORRETO — tamanho aumenta progressivamente
<h1 className="text-xl lg:text-3xl font-bold">AI Grammar Check</h1>
<h1 className="text-2xl lg:text-4xl font-bold">Caption Generator</h1>

// Para AIMeetingPage com text-5xl:
<h1 className="text-2xl lg:text-5xl font-bold">AI Meeting</h1>
```

**Views corrigidas (15 arquivos):** TranslatorPage, EmailPage, OCRPage, QuizPage, ResumePage, VoiceAgentPage, WebsiteWikiPage, InterviewPage, MeetingNotesPage, RecipePage, SQLPage, SentimentPage, SocialMediaPage, StoryPage, ImageGeneratorPage, GrammarPage, InstagramCaptionGenerator, AIMeetingPage.

### Regra para a Equipe
> **Nunca use `text-3xl` ou maior sem prefixo responsivo em páginas que têm usuários mobile.** A escala padrão: `text-xl lg:text-3xl` (títulos de seção), `text-2xl lg:text-4xl` (títulos de página), `text-3xl lg:text-5xl` (hero/destaque). Sempre pense: "como isso fica em 375px?"

---

## Bug #8 — Grid de Duas Colunas Comprimindo em Mobile {#bug-8}

### Sintoma
O seletor de estilo do Instagram Caption Generator aparecia com dois elementos muito estreitos e ilegíveis lado a lado em mobile.

### Causa Raiz

```jsx
// InstagramCaptionGenerator — PROBLEMÁTICO
<div className="grid grid-cols-2 gap-4">
  <Select>...</Select>
  <Select>...</Select>
</div>
```

`grid-cols-2` sem breakpoint é sempre duas colunas — em mobile cada coluna tem `(375px - padding - gap) / 2 ≈ 165px`, muito estreito para um Select com label.

### Solução

```jsx
// CORRETO — uma coluna em mobile, duas em sm+
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### Regra para a Equipe
> **Grids de 2+ colunas precisam de breakpoint responsivo.** Regra base: `grid-cols-1 sm:grid-cols-2` para 2 colunas, `grid-cols-1 md:grid-cols-3` para 3 colunas. Nunca use `grid-cols-2` ou mais sem prefixo responsivo a menos que o conteúdo seja garantidamente pequeno (ex: badges, ícones).

---

## Resumo das Lições Aprendidas {#lições-aprendidas}

| # | Padrão Problemático | Padrão Correto |
|---|---|---|
| 1 | `container` dentro do `Layout` | `w-full max-w-[X] mx-auto` |
| 2 | `initial={{ opacity: 0, x: ±N }}` | `initial={{ opacity: 0 }}` |
| 3 | `overflow-x: clip` | `overflow-x: hidden !important` no body |
| 4 | `fixed` + `blur()` visível no mobile | `hidden lg:block` nesses elementos |
| 5 | `useTransform(scrollY, [0, 300], [1, 0])` em hero | Range >> altura do viewport OU remover em mobile |
| 6 | `overflow-auto` em containers de output | `overflow-y-auto overflow-x-hidden` |
| 7 | Sem `touch-action` no body | `touch-action: pan-y` em mobile |
| 8 | Texto longo sem truncate em botões | `overflow-hidden` + limitar caracteres |
| 9 | Ícone `w-X h-X` em flex sem `shrink-0` | Sempre `shrink-0` + `min-w-0` no sibling |
| 10 | `text-3xl+` fixo em views | `text-xl lg:text-3xl` (responsivo) |
| 11 | `grid-cols-2` sem breakpoint | `grid-cols-1 sm:grid-cols-2` |

---

## Checklist para Novos Componentes {#checklist}

Use esta lista antes de fazer deploy de qualquer componente novo:

### Layout & Containers
- [ ] Não usa classe `container` dentro de componente dentro do `Layout`
- [ ] Max-width definido com `w-full max-w-[X] mx-auto`
- [ ] Padding do root wrapper: `p-4 lg:p-6` (não `p-6` fixo)

### Animações Framer Motion
- [ ] Sem `x:` ou `y:` em animações (`initial`/`animate`/`whileInView`)
- [ ] Scroll-driven effects (`useTransform`) testados em viewport mobile
- [ ] Elementos `position: fixed` com blur: `hidden lg:block`

### Texto & Tipografia
- [ ] Títulos de página: `text-xl lg:text-3xl` ou maior com prefixo
- [ ] Texto dinâmico longo em botões: truncado com `overflow-hidden`
- [ ] Texto em containers: pode quebrar linha (`break-words` se necessário)

### Flex & Grid
- [ ] Ícones com dimensões fixas em flex: `shrink-0`
- [ ] Div de texto irmão de ícone: `min-w-0`
- [ ] Grid de 2+ colunas: `grid-cols-1 sm:grid-cols-2`

### Scroll & Touch
- [ ] Containers de output: `overflow-y-auto overflow-x-hidden` (não `overflow-auto`)
- [ ] Body mobile: `touch-action: pan-y` no globals.css
- [ ] Nenhum elemento causando scroll horizontal (teste: DevTools mobile 375px)

---

## Arquivos Modificados Nesta Sessão

```
app/globals.css
src/components/layout/Layout.tsx
src/components/tools/ToolPage.tsx
src/components/tools/HeadlineGenerator.tsx
src/components/tools/InstagramCaptionGenerator.tsx
src/views/LandingPage.tsx
src/views/AIMeetingPage.tsx
src/views/GrammarPage.tsx
src/views/TranslatorPage.tsx
src/views/EmailPage.tsx
src/views/OCRPage.tsx
src/views/QuizPage.tsx
src/views/ResumePage.tsx
src/views/VoiceAgentPage.tsx
src/views/WebsiteWikiPage.tsx
src/views/InterviewPage.tsx
src/views/MeetingNotesPage.tsx
src/views/RecipePage.tsx
src/views/SQLPage.tsx
src/views/SentimentPage.tsx
src/views/SocialMediaPage.tsx
src/views/StoryPage.tsx
src/views/ImageGeneratorPage.tsx
src/views/SummarizerPage.tsx
src/views/FinancePage.tsx
src/views/WriterPage.tsx
src/views/StoryPage.tsx (StoryPage custom view)
src/views/ForgotPasswordPage.tsx
src/views/LoginPage.tsx
src/views/RegisterPage.tsx
```

---

*Relatório gerado após sessão de correção de bugs mobile — MediaGeek AI Platform, Julho 2026.*
