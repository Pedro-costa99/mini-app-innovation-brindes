# Innovation Brindes — Mini App / Versão 0001

Aplicação desenvolvida em **Next.js + TypeScript + TailwindCSS** para teste técnico.  
Inclui fluxo de autenticação, gerenciamento de sessão com **Zustand**, favoritos persistidos e listagem de produtos.

## 🚀 Como rodar o projeto

Clone o repositório, instale as dependências com `npm install` e rode o servidor de desenvolvimento com `npm run dev`.  
O projeto ficará disponível em `http://localhost:3000`.

## 🔑 Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com a variável:
NEXT_PUBLIC_API_BASE=https://sua-api.com

Essa variável define a URL base para as chamadas de API.

## 🛠️ Decisões técnicas

- **Framework**: [Next.js](https://nextjs.org/) escolhido pela simplicidade e suporte a SSR/SSG.  
- **Estilização**: [TailwindCSS](https://tailwindcss.com/) para agilizar a construção da interface.  
- **Gerenciamento de estado global**: [Zustand](https://github.com/pmndrs/zustand) para controlar autenticação e favoritos com persistência em storage.  
- **Autenticação**: controle de sessão via token JWT, armazenado em `localStorage` quando a opção *remember me* está ativa.  


## ⚠️ O que ficou pendente

- Lighthouse (no DevTools) ≥ 90 em Performance e Acessibilidade (desktop)
- Dark mode (toggle, preferências salvas).
- 1–2 testes unitários (Vitest/Jest + React Testing Library) para componentes de UI.  
- 1 smoke E2E (Playwright) que valide fluxo: login → ver grid.
- Tratamento de estados refinado (ex.: placeholder de imagem, retry/backoff)
- guardar o estado do usuário em estado global pra usar oportunamente, no Navbar por exemplo.

## 🌐 Deploy

O projeto foi implantado na **Vercel** e pode ser acessado nos links (necessário autenticação):

- [Página inicial](https://mini-app-innovation-brindes.vercel.app/)  
- [Login](https://mini-app-innovation-brindes.vercel.app/login)  
- [Produtos](https://mini-app-innovation-brindes.vercel.app/produtos)

# App - Desktop
![App - Desktop](public/images/img-desktop.png)