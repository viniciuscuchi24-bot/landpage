# ⛏️ MineHost — Landing Page de Hospedagem de Minecraft

Landing page desenvolvida para a disciplina de **Programação III** do
Curso Técnico Integrado ao Ensino Médio em **Desenvolvimento de Sistemas** — IF-SC.

O projeto simula o site de uma empresa fictícia de hospedagem de servidores de
Minecraft. Ele tem landing page, página de planos, uma página de assinatura para
cada plano, confirmação do pedido e painel do cliente, tudo feito com
**HTML5, CSS3 e JavaScript puro**, sem frameworks.

## 🚀 Demonstração

O site está publicado no GitHub Pages:
**[https://viniciuscuchi24-bot.github.io/landpage/](https://viniciuscuchi24-bot.github.io/landpage/)**

## 🧭 Páginas e fluxo de navegação

| Página | O que faz |
| --- | --- |
| `index.html` | Landing page com hero, recursos e suporte (dúvidas frequentes e formulário de contato). O botão **Saiba mais** mostra os preços dos planos. |
| `planos.html` | Os planos Noob, Pro e Hacker lado a lado, com o Herobrine atrás do plano Hacker. |
| `assinar-noob.html` | Página de assinatura do plano **Noob**. |
| `assinar-pro.html` | Página de assinatura do plano **Pro**. |
| `assinar-hacker.html` | Página de assinatura do plano **Hacker**. |
| `obrigado.html` | Confirmação da assinatura, com o resumo do pedido. |
| `painel.html` | Painel do cliente, com a lista de servidores assinados. |

**Fluxo:** `index` → `planos` → `assinar-(plano)` → `obrigado` → `painel`

## 💎 Planos

| Plano | Preço | Destaques |
| --- | --- | --- |
| **Noob** | R$ 14,90/mês | 10 jogadores, 2 GB de RAM, CPU compartilhada, suporte por ticket |
| **Pro** | R$ 29,90/mês | 30 jogadores, 6 GB de RAM, CPU dedicada, suporte prioritário, mods e plugins |
| **Hacker** | R$ 49,90/mês | 100 jogadores, 12 GB de RAM, CPU de alta performance, suporte 24/7, backup automático |

## ✨ Funcionalidades

- **Saiba mais:** o botão do hero mostra e esconde o painel de preços.
- **Todos os botões funcionam:** *Ver planos*, *Assinar*, *Painel do Cliente*, menu do celular, copiar Pix, copiar endereço e cancelar assinatura.
- **Assinatura por plano:** formulário com dados do cliente, nome e tipo do servidor, período de cobrança e forma de pagamento (Pix, cartão ou boleto).
- **Cálculo automático do total:** mensal, trimestral (5% de desconto) ou anual (15% de desconto), atualizado na hora no resumo do pedido.
- **Validação dos campos:** e-mail, nick do Minecraft, nome do servidor e dados do cartão (com máscara de número e validade).
- **Painel do cliente:** mostra as assinaturas feitas no navegador e permite cancelar com confirmação.
- **Layout responsivo:** funciona em computador, tablet e celular.
- **Acessibilidade:** foco visível no teclado, textos alternativos nas imagens e respeito à opção de reduzir animações do sistema.

## 📁 Estrutura do projeto

```
landpage/
├── index.html
├── planos.html
├── assinar-noob.html
├── assinar-pro.html
├── assinar-hacker.html
├── obrigado.html
├── painel.html
├── estilo.css
├── script.js
├── readme.md
└── img/
    ├── hero-ilha.jpg
    ├── steve.jpg
    ├── herobrine.jpg
    └── favicon.svg
```

## 🛠️ Tecnologias

- **HTML5** semântico (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `details`)
- **CSS3** em um único arquivo, com variáveis, flexbox, grid, `position: sticky`, `mask-image` e media queries
- **JavaScript** puro, em um único arquivo, com `localStorage` para guardar as assinaturas
- **Google Fonts:** Pixelify Sans (títulos) e Inter (textos)

## 💻 Como executar localmente

1. Baixe ou clone o repositório.
2. Abra o arquivo `index.html` no navegador.

As fontes do Google precisam de internet para aparecer.

## ⚠️ Observações

- É um **site fictício**, criado para fins educacionais.
- É uma **demonstração**: nenhum pagamento é real e os dados do cartão **não são guardados**.
- As assinaturas ficam salvas só no `localStorage` do navegador de quem usa o site.
- Minecraft é uma marca da Mojang Studios. Este projeto não tem relação com a Mojang nem com a Microsoft.

## 👤 Autor

Vinicius Arthur Batista Cuchi — Curso Técnico Integrado ao Ensino Médio em Desenvolvimento de Sistemas, IF-SC.
