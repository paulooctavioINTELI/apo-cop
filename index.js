require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const cron = require('node-cron');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

// Carregar as variáveis de ambiente
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const reportChannelId = process.env.CHANNEL_ID; // Canal onde o relatório será enviado

// Objeto para armazenar os tempos dos usuários
let userTimes = {};

// Função para calcular o tempo que um usuário ficou em uma chamada
function calculateTimeInCall(userId, channelId) {
  const now = Date.now();
  const user = userTimes[userId];
  if (user && user[channelId] && user[channelId].joinTime) {
    const timeSpent = now - user[channelId].joinTime;
    user[channelId].totalTime = (user[channelId].totalTime || 0) + timeSpent;
    user[channelId].joinTime = null; // Resetar o joinTime após calcular
  }
}

// Função para resetar os tempos de conexão
function resetJoinTimes(userId) {
  const user = userTimes[userId];
  if (user) {
    for (const channelId in user) {
      if (user[channelId].joinTime) {
        user[channelId].joinTime = null;
      }
    }
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Agendar a tarefa diária para enviar o resumo às 23:59
  cron.schedule('59 23 * * *', () => {
    sendDailySummary();
  });

  // Registrar o comando /teste
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [
        {
          name: 'teste',
          description: 'Envia o resumo diário de tempo em chamadas',
        },
      ] },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const userId = newState.id;

  if (!userTimes[userId]) {
    userTimes[userId] = {};
  }

  // Se o usuário se desconectou de um canal de voz
  if (oldState.channelId && !newState.channelId) {
    calculateTimeInCall(userId, oldState.channelId);
  }

  // Se o usuário mudou de canal
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    calculateTimeInCall(userId, oldState.channelId);
    if (!userTimes[userId][newState.channelId]) {
      userTimes[userId][newState.channelId] = { totalTime: 0, joinTime: null };
    }
    userTimes[userId][newState.channelId].joinTime = Date.now();
  }

  // Se o usuário se conectou a um novo canal de voz
  if (!oldState.channelId && newState.channelId) {
    if (!userTimes[userId][newState.channelId]) {
      userTimes[userId][newState.channelId] = { totalTime: 0, joinTime: null };
    }
    userTimes[userId][newState.channelId].joinTime = Date.now();
  }
});

// Função para enviar o resumo diário
async function sendDailySummary() {
  console.log('Sending daily summary...');
  const guild = client.guilds.cache.get(guildId);
  const channel = guild.channels.cache.get(reportChannelId);

  if (!guild || !channel) {
    console.error('Guild or Channel not found');
    return;
  }

  let summary = 'Resumo diário do tempo em chamada:\n';

  for (const [userId, channels] of Object.entries(userTimes)) {
    summary += `<@${userId}>:\n`;
    let userTotalTime = 0;

    for (const [channelId, data] of Object.entries(channels)) {
      calculateTimeInCall(userId, channelId); // Certifique-se de que todo o tempo seja calculado antes de enviar o resumo
      const timeInMinutes = Math.floor((data.totalTime || 0) / 1000);
      userTotalTime += timeInMinutes;
      summary += `  Canal <#${channelId}>: ${timeInMinutes} minutos\n`;
    }

    summary += `  Total: ${userTotalTime} minutos\n\n`;
  }

  await channel.send(summary);
  console.log('Summary sent.');

  // Resetar os tempos após enviar o resumo
  userTimes = {};
}

client.on('interactionCreate', async interaction => {
  console.log('Interaction received:', interaction);
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'teste') {
    await interaction.deferReply();
    await sendDailySummary();
    await interaction.followUp('Resumo diário enviado!');
  }
});

client.login(token);
