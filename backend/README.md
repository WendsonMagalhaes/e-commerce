# 🛍️ Projeto E-commerce - Backend

Este projeto é uma API para um sistema de e-commerce, desenvolvida com NestJS e banco de dados SQLite. A aplicação oferece suporte completo para operações essenciais de uma loja virtual, como autenticação de usuários, gerenciamento de carrinho, favoritos e finalização de compras.

---

## 🔧 Tecnologias Utilizadas

- **NestJS** — Framework moderno baseado em Node.js e TypeScript.

- **TypeORM** — ORM para comunicação com banco de dados relacional.

- **SQLite** — Banco de dados leve e fácil de configurar.

- **JWT** — Autenticação segura com tokens.

- **Jest** — Framework de testes unitários.
  
---

## ✨ Principais Funcionalidades

- **Cadastro** e **login** de usuários com senha criptografada.

- Sistema de **autenticação** com JWT.

- **Adição**, **remoção** e **listagem** de produtos no carrinho.

- Marcação de produtos como **favoritos**.

- Finalização de **vendas** e **histórico** de compras.

- Integração com **produtos unificados** de múltiplos provedores.

- **Testes automatizados** com cobertura de funcionalidades.

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js v20+
- npm ou yarn
- Arquivo .env configurado com as variáveis necessárias, como *JWT_SECRET*, *PORT* e *UNSPLASH_ACCESS_KEY*

---

### 1. Clone o repositório

```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

```bash
# Chave secreta para JWT
JWT_SECRET=sua_jwt_secret_aqui

# Porta da aplicação
PORT=8080

# Chave de acesso à API do Unsplash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```
**Observação**: Para obter sua própria chave de acesso à *API do Unsplash*, crie uma conta e registre seu aplicativo na plataforma, ou pode utilizar a chave fornecida abaixo, caso não deseje criar uma conta:

```bash
UNSPLASH_ACCESS_KEY=z5dx8KQy1lJ63bl78WASVfdSFPUFO5Y8-KAGkhRbGW0
```
**Atenção**: O uso dessa chave é público e sujeito a limites. Para produção, recomenda-se gerar sua própria chave.

### 4. Rode o projeto

```bash
npm run start
```

O backend estará disponível em: [http://localhost:8080](http://localhost:8080)

### 5. Rodando os testes

```bash
npm run test
```

---

## ⚙️ Decisões Técnicas


#### Arquitetura modular com NestJS

Adotei o **NestJS** pela sua estrutura orientada a módulos e injeção de dependência nativa, o que facilita:

- Organização por responsabilidades (ex: `auth`, `users`, `cart`, etc.).
- Testabilidade e escalabilidade com baixo acoplamento.
- Uso do `@nestjs/common` para consistência nos controladores e serviços.


#### TypeORM com SQLite

- **SQLite** foi escolhido para ambiente de desenvolvimento e testes, pois:
  - É leve e não requer instalação adicional.
  - Permite prototipagem rápida e portabilidade.
- **TypeORM** fornece abstração para trabalhar com entidades, relacionamentos e repositórios com facilidade.

#### Estrutura do Projeto

O projeto segue a **arquitetura modular** do NestJS, dividindo funcionalidades por **domínios** (_feature-based architecture_). Essa organização facilita a **manutenção**, **escalabilidade** e **testabilidade** do código.

```bash
src/
├── auth/ # Módulo de autenticação (login, registro, JWT)
├── cart/ # Módulo de carrinho de compras
├── favorite/ # Módulo de favoritos
├── products/ # Módulo de produtos unificados de múltiplos provedores
├── sale/ # Módulo de vendas e histórico de compras
├── users/ # Módulo de usuários
├── app.module.ts # Módulo raiz que importa e integra os outros módulos
├── main.ts # Ponto de entrada da aplicação
```
##### Estrutura comum em cada módulo

- `*.controller.ts`: define as rotas da API.
- `*.service.ts`: implementa a lógica de negócio.
- `*.entity.ts`: define os modelos de dados (entidades do TypeORM).
- `*.spec.ts`: arquivos de testes unitários (Jest).

Essa abordagem:

- Separa responsabilidades por domínio.
- Permite escalar e manter módulos de forma independente.
- Facilita os testes e reutilização de código.
- Alinha-se aos princípios **SOLID** e boas práticas de **DDD** (Domain-Driven Design).

#### Autenticação com JWT

- Tokens JWT são usados para autenticar e proteger rotas.
- O `JwtModule` é configurado com chave secreta e expiração de 8 horas.
- Os tokens são validados automaticamente via `Passport` + `JwtStrategy`.


#### Sincronização de carrinho e favoritos

- O backend aceita adições ao carrinho e favoritos mesmo após login.
- Isso facilita a lógica de sincronização com clientes mobile/web.
- Itens são relacionados a usuários autenticados após login.


#### Testes unitários com Jest

- Testes escritos com `@nestjs/testing` e `jest` para garantir:
  - Autenticação com credenciais válidas/inválidas.
  - Criação e recuperação de carrinho.
  - Comportamento de favoritos e vendas.
- Mocks utilizados para `Repository`, `UsersService`, `ProductsService`, etc.


#### Armazenamento de produtos (unificados)

- O serviço `ProductsService` abstrai a busca de produtos por diferentes fontes (provedores).
- Armazenamento com `simple-json` permite salvar metadados completos do produto como objeto JSON.


#### Segurança

- Todas as rotas sensíveis usam `@UseGuards(AuthGuard('jwt'))`.
- Dados como senhas são criptografados com `bcrypt` antes de persistência.
- Validações básicas de input com `class-validator`.
