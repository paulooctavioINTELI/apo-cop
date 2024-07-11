const express = require('express');
const https = require('https');
const client = require('./bot');
const config = require('./config');
const voiceStateService = require('./services/voiceStateService');
const ReportService = require('./services/reportService');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

let botStarted = false;

// Verificação das variáveis de ambiente
console.log('Config values:');
console.log('TOKEN:', config.token ? 'exists' : 'not found');
console.log('CLIENT_ID:', config.clientId ? 'exists' : 'not found');
console.log('GUILD_ID:', config.guildId ? 'exists' : 'not found');
console.log('CHANNEL_ID:', config.channelId ? 'exists' : 'not found');

// Teste de conectividade para os servidores do Discord
https.get('https://discord.com/api/v9', (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log('Discord API reachable:', JSON.parse(data));
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

// Inicialize o serviço de relatório com o cliente e o serviço de estado de voz
const reportService = new ReportService(voiceStateService, client);

const startBot = () => {
  if (botStarted) {
    console.log('Bot is already started.');
    return;
  }

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Agendar a tarefa diária para enviar o resumo às 23:59
    cron.schedule('59 23 * * *', () => {
      reportService.sendDailySummary();
    });

    // Verificação periódica para garantir que o bot está online
    cron.schedule('*/5 * * * *', () => {
      if (!client.isReady()) {
        console.log('Bot is not ready, attempting to reconnect...');
        client.login(config.token).catch(console.error);
      }
    });
  });

  client.on('voiceStateUpdate', (oldState, newState) => {
    console.log('voiceStateUpdate detected');
    voiceStateService.handleVoiceStateUpdate(oldState, newState);
  });

  client.on('interactionCreate', async interaction => {
    console.log('interactionCreate detected');
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, reportService);
    } catch (error) {
      console.error('Error executing command:', error);
      await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
    }
  });

  client.on('disconnect', () => {
    console.log('Bot disconnected. Attempting to reconnect...');
    client.login(config.token).catch(console.error);
  });

  // Log events to check the state
  client.on('reconnecting', () => console.log('Bot reconnecting...'));
  client.on('resume', () => console.log('Bot connection resumed.'));
  client.on('error', (error) => console.error('Discord client error:', error));
  client.on('warn', (info) => console.warn('Discord client warn:', info));

  // Tente fazer login no Discord
  console.log('Attempting to log in...');
  client.login(config.token).then(() => {
    console.log('Login successful.');
    botStarted = true;
  }).catch((error) => {
    console.error('Error logging in:', error);
  });
};

const stopBot = () => {
  if (!botStarted) {
    console.log('Bot is not running.');
    return;
  }

  client.destroy();
  console.log('Bot stopped.');
  botStarted = false;
};

// Endpoints para iniciar e parar o bot
app.get('/start', (req, res) => {
  startBot();
  res.send('Bot started!');
});

app.get('/stop', (req, res) => {
  stopBot();
  res.send('Bot stopped!');
});

// Servidor HTTP básico
app.get('/', (req, res) => res.send('Bot is running!'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
