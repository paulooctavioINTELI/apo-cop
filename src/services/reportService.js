const { EmbedBuilder } = require('discord.js');
const { channelId, guildId } = require('../config');

class ReportService {
  constructor(voiceStateService, client) {
    this.voiceStateService = voiceStateService;
    this.client = client;
  }

  async sendDailySummary() {
    const guild = this.client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);

    if (!guild || !channel) {
      console.error('Guild or Channel not found');
      return;
    }

    const userTimes = this.voiceStateService.getUserTimes();
    const summary = this.buildSummary(userTimes, true);

    const embed = new EmbedBuilder()
      .setTitle('Resumo diário do tempo em chamada')
      .setDescription(summary)
      .setColor('#7289DA')
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    this.voiceStateService.resetUserTimes();
    console.log('Summary sent.');
  }

  async sendUntilNow(interaction) {
    const userTimes = this.voiceStateService.getUserTimes();
    const summary = this.buildSummary(userTimes, false);

    const embed = new EmbedBuilder()
      .setTitle('Resumo parcial do tempo em chamada até agora')
      .setDescription(summary)
      .setColor('#7289DA')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    console.log('Partial summary sent.');
  }

  buildSummary(userTimes, isFinalSummary) {
    return Object.entries(userTimes).map(([userId, channels]) => {
      let userSummary = `<@${userId}>:\n`;
      let userTotalTime = 0;

      const channelSummary = Object.entries(channels).map(([channelId, data]) => {
        let totalTime = data.totalTime;
        if (!isFinalSummary && data.online) {
          totalTime += this.voiceStateService.getCurrentTimeInCall(userId, channelId);
        }
        const timeInMinutes = Math.floor((totalTime || 0) / 1000);
        userTotalTime += timeInMinutes;
        return `  Canal <#${channelId}>: ${timeInMinutes} minutos\n`;
      }).join('');

      userSummary += channelSummary;
      userSummary += `  Total: ${userTotalTime} minutos\n\n`;
      return userSummary;
    }).join('');
  }
}

module.exports = ReportService;
