# 🛍️ E-commerce Fullstack

Projeto completo de E-commerce com **API backend (NestJS)**, **interface web (React.js)** e **aplicativo mobile (Flutter)**.

O sistema permite que usuários naveguem por produtos, adicionem itens ao carrinho, marquem como favoritos, realizem compras e acompanhem seu histórico. Possui autenticação JWT, suporte a múltiplos idiomas e tema claro/escuro.

---

## 📂 Estrutura do Repositório

```bash
e-commerce/
├── backend/    # API - NestJS + TypeORM + SQLite
├── frontend/   # Web App - React.js + Context API
└── mobile/     # App Mobile - Flutter + Provider
```

---

## ⚙️ Tecnologias Utilizadas

| Camada       | Tecnologias                                                           |
| ------------ | --------------------------------------------------------------------- |
| **Backend**  | NestJS · TypeORM · SQLite · JWT · Jest                                |
| **Frontend** | React.js · Context API · React Router · Axios · i18next · CSS Modules |
| **Mobile**   | Flutter · Dart · Provider · HTTP · SharedPreferences                  |

---

## ✨ Funcionalidades Principais

- Cadastro e login com senha criptografada
- Autenticação JWT com rotas protegidas
- Carrinho persistente (autenticado ou visitante)
- Sistema de favoritos com sincronização
- Listagem e detalhamento de produtos
- Histórico de pedidos
- Alternância entre tema claro e escuro
- Suporte a múltiplos idiomas (PT/EN)
- Sincronização inteligente entre plataformas
- Feedback visual com modais

---

## 🚀 Como Rodar o Projeto

### Backend (NestJS)

#### Pré-requisitos:
- Node.js v20+
- Arquivo `.env` com:
  ```bash
  JWT_SECRET=sua_jwt_secret
  PORT=8080
  UNSPLASH_ACCESS_KEY=z5dx8KQy1lJ63bl78WASVfdSFPUFO5Y8-KAGkhRbGW0
  ```

#### Passos:
```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd backend
npm install
npm run start
```

Acesse: [http://localhost:8080](http://localhost:8080)

#### Testes:
```bash
npm run test
```

---

### Frontend Web (React)

#### Pré-requisitos:
- Node.js v16+
- Backend rodando

#### Passos:
```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd frontend
npm install
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

### Aplicativo Mobile (Flutter)

#### Pré-requisitos:
- Flutter 3.10+
- Emulador ou dispositivo físico
- Backend rodando

#### Passos:
```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd mobile
flutter pub get
flutter run
```

O app será executado no emulador/dispositivo conectado.

---

## Decisões Técnicas

### Backend

- **Arquitetura modular** baseada em domínios (`auth`, `cart`, `products`, etc)
- **JWT + Passport** para autenticação segura
- **SQLite** como banco leve e prático para testes
- **TypeORM** com `simple-json` para objetos complexos
- **Testes automatizados** com Jest

### Frontend

- **Context API** para gerenciar carrinho, tema, favoritos e idioma
- **localStorage** para persistência de usuários visitantes
- **Axios com interceptadores** para incluir JWT
- **Tema escuro/claro** com toggle e persistência
- **Estrutura modular** com separação clara de responsabilidades

### Mobile

- **Provider** como gerenciador de estado global
- **SharedPreferences** para token e preferências
- **HTTP** com serviços centralizados (auth, cart, etc)
- **Componentes reutilizáveis** e navegação com `Navigator.push`
- **Sincronização de dados** após login

---



## 💡 Observações

- A chave `UNSPLASH_ACCESS_KEY` fornecida é pública e tem limites. Para produção, crie sua própria.
- Este projeto foi desenvolvido como parte de um **teste técnico**, com foco em boas práticas, clareza de arquitetura e usabilidade.

---

