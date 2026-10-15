# ProjetoViagemSAE — SESI Aventura Educativa

Aplicação em React, Vite e Tailwind CSS para apoio à organização de viagens educativas.

## Estado atual
O frontend inicial está disponível neste repositório. As seções incluem login, cadastro, painel, cronograma, professores, transportes, recursos, informações extras e autorizações.

**Importante:** esta é uma demonstração. O login e o cadastro não se conectam a uma autenticação real, e as páginas não têm controle de acesso. Não utilizar dados pessoais ou escolares reais.

O cronograma armazena informações apenas no navegador local, sem sincronização entre usuários.

O backend Laravel e outros arquivos do pacote original ainda não foram publicados integralmente, portanto o projeto completo não está disponível neste repositório.

## Executar o frontend
Requer Node.js compatível com o Vite instalado.

```bash
cd frontend
npm install
npm run dev
```

## Pendências
- Publicar todos os arquivos do backend Laravel e os demais recursos do ZIP revisado.
- Integrar autenticação e permissões no servidor.
- Persistir as viagens no banco de dados em vez de somente no armazenamento local.
- Validar instalação, build, testes e implantação.
