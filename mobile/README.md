# 🛍️ Projeto E-commerce - Mobile

Este projeto é o aplicativo mobile para um sistema de e-commerce, desenvolvido em Flutter. Ela consome a API backend para oferecer uma experiência completa para navegação, login, favoritos, carrinho de compras, e histórico de pedidos, adaptada para dispositivos móveis.

---

## 🔧 Tecnologias Utilizadas

- **Flutter** — Framework para construção de apps nativos para Android e iOS.
- **Dart** — Linguagem utilizada pelo Flutter.
- **Provider** / **Stateful Widgets** — Gerenciamento de estado simples.
- **HTTP** — Comunicação com a API backend.
- **Shared Preferences**— Armazenamento local de dados (JWT, tema).
- **Custom Widgets** — Componentes reutilizáveis como Header, ProductCard, CartItem e Modal de mensagens.

---

## ✨ Principais Funcionalidades

- **Listagem de produtos** com informações básicas e imagem.
- **Detalhes do produto** com galeria, descrição, ficha técnica e botão de favoritar/adicionar ao carrinho.
- **Carrinho de compras** com seleção, resumo, edição de quantidade e finalização.
- **Sistema de favoritos** com persistência e sincronização com backend.
- **Autenticação** com login e armazenamento do token JWT localmente.
- **Histórico de compras** com visualização por data e total por item.
- **Tema** claro e escuro com toggle persistente.
-**Modal de mensagens** para feedback rápido (sucesso, erro, aviso).
- **Navegação entre telas** com persistência de estado básica.

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- Flutter instalado (versão 3.10+ recomendada)
- Android Studio ou VS Code com extensão Flutter
- Emulador Android/iOS ou dispositivo físico
- API backend rodando (ex: http://localhost:8080)


### 1. Clone o repositório mobile

```bash
git clone https://github.com/WendsonMagalhaes/e-commerce.git
cd e-commerce
cd mobile
```
### 2. Instale as dependências
```bash
flutter pub get
```
### 3. Rode o projeto
```bash
flutter run
```
O frontend estará disponível em: [http://localhost:8080](http://localhost:3000)

---

## ⚙️ Decisões Técnicas

#### Provider como gerenciador de estado

Optei por Provider para controle global de estados como usuário, carrinho, favoritos, tema e idioma. Essa abordagem:

- Garante centralização do estado.
- Permite reatividade eficiente entre widgets.
- Evita múltiplos acessos ao SharedPreferences durante o uso.

#### SharedPreferences para persistência local

Utilizei SharedPreferences para armazenar:
  - Token JWT após login.
  - Preferências de tema (claro/escuro).
  - Carrinho e favoritos locais para usuários não logados.


#### Carrinho local e sincronização

  O carrinho funciona mesmo sem login:

- Itens adicionados por usuários anônimos são salvos no dispositivo.
- Após o login, os itens são enviados para a API e mesclados com o carrinho remoto.
- O armazenamento local é limpo após a sincronização.
  
#### Autenticação com JWT

Após o login, o token é armazenado no SharedPreferences e enviado em todas as requisições protegidas.

Interceptamos chamadas para garantir que o token esteja presente.

Implementamos verificação automática de login válido ao iniciar o app.

#### Alternância de tema

- O tema claro ou escuro é armazenado no dispositivo.
- O app se adapta ao sistema, mas também permite mudança manual com persistência.
- O Provider atualiza todos os widgets com base na escolha do usuário.

Comunicação com a API

- Utilizei o pacote http do Dart.
- Requisições são encapsuladas em serviços como AuthService, CartService, PurchaseService, etc.
  
#### Modularidade e organização

O projeto é dividido em:
```bash
src/
├── models/     # Entidades de dados utilizadas no app (ex: Produto, Usuário, Compra)
├── services/   # Serviços responsáveis por comunicação com a API (ex: AuthService, CartService)
├── widgets/    # Componentes visuais reutilizáveis (ex: Header, ProductCard, ModalMessage)
├── screens/    # Telas completas e organizadas por funcionalidade (ex: LoginScreen, ProductDetailScreen)
├── utils/      # Temas, constantes, helpers e formatações

```
Essa estrutura facilita a manutenção, reutilização e escalabilidade do código, mantendo a separação de responsabilidades clara.

#### Mensagens de feedback

Utilizei modais (ModalMessage) para fornecer feedbacks visuais em ações como:

- Adição ao carrinho
- Login realizado com sucesso
- Falhas em requisições
