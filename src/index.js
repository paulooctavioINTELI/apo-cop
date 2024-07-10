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
});

client.on('voiceStateUpdate', (oldState, newState) => {
  voiceStateService.handleVoiceStateUpdate(oldState, newState);
});

client.on('interactionCreate', async interaction => {
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

client.login(config.token);
