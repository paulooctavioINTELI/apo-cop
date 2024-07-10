const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untilnow') // Alterado para minúsculas
    .setDescription('Envia o resumo parcial do tempo em chamadas até o momento'),
  async execute(interaction, reportService) {
    await reportService.sendUntilNow(interaction);
  },
};
