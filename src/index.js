const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const client = require('./bot');
const config = require('./config');
const voiceStateService = require('./services/voiceStateService');
const ReportService = require('./services/reportService');
const cron = require('node-cron');

// Inicialize o serviço de relatório com o cliente e o serviço de estado de voz
const reportService = new ReportService(voiceStateService, client);

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

client.login(config.token).catch(console.error);

// Servidor HTTP básico
app.get('/', (req, res) => res.send('Bot is running!'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
