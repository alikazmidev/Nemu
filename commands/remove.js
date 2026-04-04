const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removeServerConfig } = require('../db/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove provider/API key configuration for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guildId) {
      return interaction.reply({ content: '⚠️ This command must be used in a server.', ephemeral: true });
    }

    const removed = removeServerConfig(interaction.guildId);

    return interaction.reply({
      content: removed ? '✅ Server configuration removed.' : 'ℹ️ No configuration existed for this server.',
      ephemeral: true,
    });
  },
};
