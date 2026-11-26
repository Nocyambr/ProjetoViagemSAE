# ProjetoViagemSAE — SESI Aventura Educativa

Aplicação web para organização e acompanhamento de viagens educativas do **SESI Cerquilho - SP (CE 428)**.

- **Site hospedado (Cloudflare Workers):** [https://projeto-viagem-sae.mayconarea42.workers.dev](https://projeto-viagem-sae.mayconarea42.workers.dev)

## Visão geral da arquitetura

- **Frontend (`frontend/`):** React 19, Vite 8, React Router 7 e Tailwind CSS 4.
- **Edge API & Deploy (`frontend/worker.js` e `frontend/wrangler.jsonc`):** Cloudflare Workers (`projeto-viagem-sae`) com persistência em Durable Object SQLite (`TripStore`) e entrega dos arquivos estáticos da SPA (`frontend/dist/`).
- **Backend alternativo (`backend/`):** Laravel 12 (PHP 8.2+) com banco SQLite, `TripController`, modelo `Trip` e serviço `SesiLocationService`.
- **Resiliência offline:** quando a API está indisponível, o frontend faz fallback automático para `localStorage` (`sae:trips:v2`) e mantém a sincronização ao focar a janela e entre abas (`storage` / `sae:data-updated`).

## Contas de demonstração e perfis

A tela de login (`/login`) conta com botões **Preencher automaticamente** para alternar rapidamente entre os perfis:

| Perfil | Usuário | Senha | Permissões |
| --- | --- | --- | --- |
| Professor | `professor` | `senai00` | Criar, editar, iniciar e excluir viagens; atualizar status e localização/GPS do ônibus; gerenciar equipe de professores; postar e remover fotos |
| Aluno / Pais | `usuario1` | `senai00` | Visualizar cronograma, fotos, equipe de professores e acompanhar a localização do ônibus após o professor iniciar a viagem |

- Novos usuários (alunos e responsáveis) podem se cadastrar em `/register` (senha mínima de 8 caracteres).
- A autenticação e a sessão ativa por aba são gerenciadas localmente no navegador (`sessionStorage` em `sae:auth:v2` e contas cadastradas em `localStorage` em `sae:accounts:v1`), protegendo todas as rotas internas da aplicação.

## Funcionalidades

- **Painel inicial (`/home`):** exibe o resumo das viagens cadastradas, cards de acesso às seções (bloqueados por `TripRequiredGate` até que exista pelo menos uma viagem), consulta rápida da localização atual quando uma viagem já foi iniciada e prévia das fotos recentes.
- **Configurar Viagens / Cronograma (`/data-horarios`):** criação, edição, início e exclusão de viagens; validação de datas (incluindo anos bissextos) e horários (`chegada > saída`); botão **Preencher automaticamente** com 3 presets de excursões SESI; seleção por foto de um ou ambos os professores (**Ricardo** e **André**); busca sem distinção de acentos por título ou destino; filtro por período (`Todas as viagens`, `A partir de hoje`, `Datas passadas`) e exportação do cronograma em JSON.
- **Localização do Ônibus (`/locomocoes`):** bloqueada para alunos e responsáveis até o professor iniciar a viagem (HTTP `423 Locked`); exibe a origem oficial no **SESI Cerquilho - SP** (Rua Antônio Modanez, 111 - Residencial São Francisco, CEP 18527-372), status do trajeto (`planned`, `boarding`, `transit`, `arrived`, `returning`, `finished`), coordenadas e link **Abrir no Google Maps**. Professores podem iniciar a viagem, usar preenchimento automático, aplicar a origem SESI Cerquilho, capturar o GPS do dispositivo (`navigator.geolocation`) ou informar coordenadas manualmente.
- **Fotos (`/fotos`):** envio de uma ou múltiplas imagens pelo professor com redimensionamento e compressão automática em JPEG no navegador (`<canvas>`), legenda de até 140 caracteres, filtro por viagem, ampliação em modal `<dialog>` e remoção (armazenadas em `localStorage` em `sae:photos:v1` e removidas automaticamente quando a viagem vinculada é excluída).
- **Professores (`/professores`):** exibe os perfis e fotos reais dos professores **Ricardo** e **André**, a equipe vinculada a cada viagem e o gerenciamento de membros adicionais por viagem (em `localStorage`, chave `sae:teachers:v1`).

## Endpoints da API (`/api/*`)

As rotas abaixo estão implementadas tanto no Cloudflare Worker (`frontend/worker.js`) quanto no backend Laravel (`backend/routes/api.php`):

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/location/sesi-cerquilho` | Retorna endereço e coordenadas oficiais do SESI Cerquilho - SP (CE 428) |
| `GET` | `/api/trips` | Lista todas as viagens ordenadas por data, horário de saída e título |
| `POST` | `/api/trips` | Cria uma nova viagem com localização inicial ancorada no SESI Cerquilho - SP |
| `PATCH` | `/api/trips/{id}` | Atualiza os dados e horários de uma viagem existente |
| `DELETE` | `/api/trips/{id}` | Remove uma viagem |
| `POST` | `/api/trips/{id}/start` | Inicia a viagem (status `transit`) e publica a origem no SESI Cerquilho - SP |
| `GET` | `/api/trips/{id}/location` | Retorna a localização atual da viagem iniciada (ou HTTP `423` se ainda não iniciada) |
| `PATCH` | `/api/trips/{id}/location` | Atualiza status, identificação do ônibus, referência, endereço, coordenadas e progresso |

## Estrutura do projeto

```text
ProjetoViagemSAE/
├── .github/workflows/ci.yml              # Pipeline de validação (frontend e backend)
├── frontend/
│   ├── public/images/                    # Imagens do SESI e fotos dos professores
│   ├── src/
│   │   ├── components/                   # Icon, SiteShell e TripRequiredGate
│   │   ├── lib/                          # api, auth, photos, teachers, trips e usePortalData
│   │   └── pages/                        # Login, Register, Home, Schedule, Transports, Photos, Teachers
│   ├── tests/                            # Testes unitários e de integração (node --test)
│   ├── vite.config.js                    # Proxy de /api para http://127.0.0.1:8000
│   ├── worker.js                         # Cloudflare Worker + Durable Object TripStore
│   └── wrangler.jsonc                    # Configuração do Worker e assets SPA
└── backend/
    ├── app/
    │   ├── Http/Controllers/Api/TripController.php
    │   ├── Models/Trip.php
    │   └── Services/SesiLocationService.php
    ├── database/migrations/
    ├── routes/api.php
    └── tests/Feature/TripLocationApiTest.php
```

## Como executar localmente

### Pré-requisitos

- **Frontend / Worker:** Node.js `>= 22.12.0` (recomendado Node.js 24) e npm.
- **Backend Laravel (opcional):** PHP `8.2+`, Composer e extensão SQLite (`pdo_sqlite`) habilitada.

### 1. Frontend (Vite)

```bash
cd frontend
npm ci
npm run dev
```

Quando usado com o backend Laravel local, o arquivo `frontend/vite.config.js` redireciona automaticamente as requisições `/api` para `http://127.0.0.1:8000`.

### 2. Backend Laravel (opcional)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
php artisan serve
```

### 3. Cloudflare Workers (execução local e deploy)

Para gerar os assets e simular o Worker + Durable Object SQLite localmente com o Wrangler:

```bash
cd frontend
npm ci
npm run build
npx wrangler dev
```

Para publicar no Cloudflare Workers:

```bash
cd frontend
npm run deploy
```

## Testes e integração contínua (CI)

Frontend (`frontend/`):

```bash
cd frontend
npm test      # Executa 20 testes (node --test) de cronograma, autenticação, API/fallback, fotos e professores
npm run build # Gera o build de produção em frontend/dist/
```

Backend (`backend/`):

```bash
cd backend
php artisan test
```

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executa automaticamente em `push` e `pull_request` os jobs `frontend` (Node 24: `npm ci`, `npm test`, `npm run build`) e `backend` (PHP 8.2: `composer validate --strict`, instalação de dependências, migração/configuração e `php artisan test`).

## Observações de uso e armazenamento

- **Viagens e localização do ônibus:** sincronizadas via API (Durable Object SQLite no Worker ou SQLite no Laravel) com fallback local no navegador quando offline.
- **Contas cadastradas, sessão, fotos e equipe adicional:** armazenados apenas no navegador (`sessionStorage` e `localStorage`), não sendo compartilhados entre diferentes dispositivos ou navegadores.
- Por se tratar de uma aplicação demonstrativa com credenciais pré-configuradas, não utilize dados pessoais sensíveis de alunos ou responsáveis neste ambiente.
