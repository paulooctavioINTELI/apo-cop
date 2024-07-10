### README

# Apo Cop

Apo Cop é um bot de Discord desenvolvido para rastrear e relatar o tempo que os usuários passam em canais de voz. Ele foi projetado para facilitar o monitoramento do tempo de estudo, desenvolvimento e reuniões de uma equipe.

## Como Executar

### Pré-requisitos

- Node.js v14 ou superior
- NPM (Node Package Manager)
- Conta no Discord com um servidor onde o bot será adicionado

### Configuração

1. Clone o repositório:

```sh
git clone https://github.com/seu-usuario/apogeu-master-bot.git
cd apogeu-master-bot
```

2. Instale as dependências:

```sh
npm install
```

3. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:

```plaintext
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_guild_id
CHANNEL_ID=your_discord_channel_id
```

4. Inicie o bot:

```sh
npm start
```

## Estrutura de Arquivos

```plaintext
.
├── src
│   ├── commands
│   │   ├── dailySummary.js
│   │   ├── untilNow.js
│   ├── services
│   │   ├── voiceStateService.js
│   │   ├── reportService.js
│   ├── bot.js
│   ├── config.js
│   ├── index.js
├── .env
├── package.json
```

### Descrição dos Arquivos

#### `src/commands/dailySummary.js`

Este arquivo define o comando `/dailySummary`, que envia um resumo diário do tempo que os usuários passaram em canais de voz. Este comando é usado para gerar relatórios automáticos às 23:59 todos os dias.

#### `src/commands/untilNow.js`

Este arquivo define o comando `/untilNow`, que envia um resumo parcial do tempo que os usuários passaram em canais de voz até o momento em que o comando é executado.

#### `src/services/voiceStateService.js`

Este arquivo contém a lógica para monitorar e registrar as mudanças de estado de voz dos usuários. Ele rastreia quando os usuários entram, saem ou mudam de canal de voz, e calcula o tempo que eles passaram em cada canal.

#### `src/services/reportService.js`

Este arquivo contém a lógica para gerar relatórios de tempo. Ele usa os dados de `voiceStateService` para construir e enviar relatórios diários e parciais para um canal específico no servidor Discord.

#### `src/bot.js`

Este arquivo inicializa o cliente do Discord e registra os comandos do bot. Ele também configura os eventos necessários para monitorar o estado de voz dos usuários e executar comandos.

#### `src/config.js`

Este arquivo carrega as variáveis de ambiente do arquivo `.env` e as exporta para uso em outros módulos do projeto.

#### `src/index.js`

Este é o ponto de entrada do aplicativo. Ele inicializa os serviços e configura as tarefas agendadas para enviar relatórios diários. Ele também configura os eventos para monitorar mudanças de estado de voz e comandos de interação do Discord.

### `.env`

Arquivo que contém as variáveis de ambiente necessárias para a configuração do bot. Ele deve ser mantido fora do controle de versão para proteger informações sensíveis.

### `package.json`

Arquivo que contém as informações do projeto e suas dependências. Também define os scripts para iniciar o bot.

## Executando o Bot no Render

### Passo 1: Preparar o Projeto

1. Inicialize o repositório Git (se ainda não tiver):

```sh
git init
```

2. Adicione todos os arquivos ao repositório:

```sh
git add .
```

3. Faça um commit inicial:

```sh
git commit -m "Initial commit"
```

4. Crie um repositório no GitHub e conecte-o ao seu repositório local:

```sh
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin master
```

### Passo 2: Configurar o Render

1. Acesse o [Render](https://render.com/) e crie uma conta ou faça login.

2. Crie um novo serviço:
   - Vá para o painel do Render e clique em **New +**.
   - Selecione **Web Service**.

3. Conecte o repositório do GitHub:
   - Selecione o repositório que você configurou anteriormente.

4. Configure o serviço:
   - **Name**: Dê um nome ao seu serviço.
   - **Root Directory**: Se o `package.json` estiver na raiz do repositório, deixe em branco.
   - **Environment**: Selecione `Node`.
   - **Build Command**: Deixe em branco ou use `npm install`.
   - **Start Command**: Use `npm start`.

5. Configurar variáveis de ambiente:
   - Adicione as variáveis de ambiente do seu arquivo `.env` na seção **Environment** no painel do Render.

6. Deploy:
   - Clique em **Create Web Service** e o Render iniciará o processo de build e deploy do seu bot.

### Passo 3: Verificar o Deploy

Após o Render concluir o deploy, verifique os logs para garantir que o bot foi iniciado corretamente e que não há erros. O bot deve aparecer como online no Discord.

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo `LICENSE` para mais detalhes.

---

Se precisar de mais assistência ou tiver dúvidas, sinta-se à vontade para abrir uma issue ou entrar em contato!
