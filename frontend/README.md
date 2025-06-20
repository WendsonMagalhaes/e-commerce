# 🛍️ Projeto E-commerce - Frontend

Este projeto é a interface web para um sistema de e-commerce, construída em React.js. Ela consome a API backend para oferecer funcionalidades completas para navegação, busca, filtros, carrinho de compras, favoritos, autenticação e finalização de pedidos.

---

## 🔧 Tecnologias Utilizadas

- **React.js** — Biblioteca para construção da interface do usuário.
- **React Router** — Navegação entre páginas sem recarregar.
- **Context API** — Gerenciamento global de estado (filtros, carrinho, favoritos, tema).
- **i18next** — Internacionalização e suporte multilíngue.
- **FontAwesome** — Ícones para botões e navegação.
- **Axios** — Cliente HTTP para comunicação com a API backend.
- **CSS Modules / CSS padrão** — Estilos organizados por componente.
- **JWT** — Autenticação com token armazenado localmente.
- **React Hooks** — Manipulação de estado e ciclo de vida funcional.

---

## ✨ Principais Funcionalidades

- **Listagem e busca** de produtos com filtros por categoria, departamento, material e preço.
- **Detalhes completos** de cada produto com galeria de imagens e ficha técnica.
- **Gerenciamento do carrinho** com ajuste de quantidade e remoção.
- **Sistema de favoritos** para marcar produtos preferidos.
- **Autenticação** com cadastro, login e logout usando JWT.
- **Histórico de compras** para usuários autenticados.
- **Tema claro e escuro** com toggle para o usuário escolher.
- **Suporte a múltiplos idiomas** (Português e Inglês).
- **Mensagens modais** para feedbacks rápidos (sucesso, erro).
- **Navegação responsiva** com sidebar e menu adaptados para dispositivos móveis.

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js v16+ recomendado
- npm ou yarn instalado
- API backend rodando e acessível (exemplo: http://localhost:8080)


### 1. Clone o repositório frontend

```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd frontend
```
### 2. Instale as dependências
```bash
npm install --force
# ou
yarn install --force
```
### 3. Rode o projeto
```bash
npm start
# ou
yarn start
```
O frontend estará disponível em: [http://localhost:8080](http://localhost:3000)

---

## ⚙️ Decisões Técnicas

#### Context API como gerenciador de estado

Optei pela Context API do React para controle global de estados como **carrinho**, **favoritos**, **tema** e **idioma**. 
Essa abordagem:

- Garante **centralização e consistência** dos dados em toda a aplicação.
- Permite **reatividade eficiente** entre componentes.

#### localStorage para persistência local

Utilizei `localStorage` para armazenar:

- Token **JWT** após login.
- Preferências de **tema** (claro/escuro) e **idioma**.
- Itens de **carrinho** e **favoritos** para usuários **não autenticados**.

Essa escolha garante **persistência entre sessões** e uma **experiência fluida**, mesmo para usuários que ainda não fizeram login.

#### Carrinho local com sincronização inteligente

O carrinho é funcional **mesmo sem login**:

- Produtos adicionados por visitantes são armazenados localmente.
- Após o login, os itens locais são enviados à API e **mesclados** com os dados remotos.
- O carrinho local é limpo após a sincronização para manter consistência.

Essa estratégia oferece uma jornada de compra **ininterrupta e persistente**.

#### Autenticação com JWT

Após o login, o token JWT é salvo no `localStorage` e incluído automaticamente em todas as requisições protegidas via **interceptador do Axios**.

- A aplicação valida o token no carregamento para manter sessões ativas.
- Rota e visibilidade de menus são condicionadas ao estado autenticado.

#### Alternância de tema com persistência

- A aplicação oferece **modo claro e escuro** com base no sistema ou escolha do usuário.
- A seleção é salva no `localStorage` e aplicada em toda a interface.
- O Contexto de Tema permite **alternância dinâmica** entre temas.

#### Comunicação com a API

A comunicação com a API é feita via **Axios**, encapsulada em serviços como:

- `authService`, `cartService`, `favoriteService`, `purchaseService`, etc.

Essa abordagem:

- Facilita testes e manutenção.
- Centraliza regras de negócio relacionadas à comunicação externa.
- Reduz duplicação de lógica nas páginas e componentes.

#### Modularidade e organização

O projeto segue uma estrutura modular clara:

```bash
src/
├── context/ # Contextos globais (tema, carrinho, filtros e favaritos.)
├── services/ # Integração com a API
├── pages/ # Telas principais
├── components/ # Componentes reutilizáveis
├── utils/ # Helpers e formatadores

```

Essa estrutura garante **escalabilidade**, **reutilização** e **manutenção simplificada**.

#### Mensagens de feedback

  A aplicação utiliza mensagens visuais e modais para informar ações como:
  - Login realizado
  - Produto adicionado ao carrinho
  - Erros de autenticação ou requisições

