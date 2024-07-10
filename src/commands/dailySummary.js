const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dailysummary') // Alterado para minúsculas
    .setDescription('Envia o resumo diário de tempo em chamadas'),
  async execute(interaction, reportService) {
    await reportService.sendDailySummary();
    await interaction.reply('Resumo diário enviado!');
  },
};
