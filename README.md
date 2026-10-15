# ProjetoViagemSAE — SESI Aventura Educativa

Interface para organização de viagens educativas, com React 19, Vite 8 e Tailwind CSS. O diretório `backend/` contém a estrutura inicial do Laravel 12 incluída no projeto original.

## Executar a interface

Requisitos: Node.js 22.12+ (recomendado: Node.js 24) e npm.

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite. Na tela de login, use **Explorar demonstração** para acessar as páginas sem criar uma conta.

```bash
npm test
npm run build
npm run preview
```

O build fica em `frontend/dist/`. Ao hospedar a interface, configure o servidor para devolver `index.html` para rotas como `/home` e `/data-horarios` (fallback de SPA).

## Executar o backend

Requisitos: PHP 8.2+, Composer e extensão SQLite habilitada.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
php artisan serve
```

O backend e a interface são aplicações separadas. O Laravel ainda não oferece endpoints de autenticação ou gestão de viagens para a interface. A página inicial do Laravel não é o frontend React.

Para testar o esqueleto Laravel: `php artisan test` em `backend/` após a configuração acima.

## Funcionalidades atuais

- Páginas de apresentação: painel, recursos, informações, professores, transporte e autorizações.
- Cronograma demonstrativo: adicionar e excluir viagens, ordenar por data e horário, validar datas e persistir no navegador.
- A exclusão solicita confirmação; uma falha de gravação mantém o formulário preenchido e a lista anterior.
- Dados salvos inválidos geram um aviso e exibem exemplos, sem sobrescrever automaticamente o conteúdo anterior. Uma alteração salva substitui esse conteúdo.
- Login e cadastro são formulários demonstrativos. Eles não criam contas ou sessões e não enviam os dados a uma API. A navegação é pública, sem proteção de rotas.
- Contatos, transportes e informações do painel são exemplos, sem confirmação de disponibilidade.

O cronograma usa `localStorage`: não sincroniza entre usuários, navegadores ou dispositivos. Limpar os dados do navegador apaga esse cronograma. Não utilizar dados pessoais reais de estudantes nesta demonstração.

## Qualidade e validação

- `npm test`: 12 testes de regressão para o cronograma, incluindo falhas de armazenamento, conteúdo inválido, anos bissextos, ordenação e exclusão.
- `npm run build`: compilação de produção da interface.
- `.github/workflows/ci.yml`: instalação, testes e build do frontend; validação do Composer e testes do Laravel no GitHub Actions.
- A revisão foi validada localmente com os testes JavaScript e o build. PHP e Composer não estavam disponíveis no ambiente de revisão; a validação PHP fica no pipeline.

## Próximas melhorias

1. Implementar autenticação, sessões e permissões no Laravel.
2. Criar modelo de dados e API para viagens, turmas, responsáveis e autorizações.
3. Integrar a interface à API e substituir a persistência local por banco de dados.
4. Implementar envio e aprovação de autorizações e documentos.
5. Ampliar testes de interface e revisar acessibilidade antes de uso operacional.

Os arquivos do anexo estão distribuídos em `frontend/` e `backend/`. O `.gitignore` impede a inclusão de dependências, builds, arquivos de ambiente e bancos SQLite locais.
