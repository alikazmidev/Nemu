const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getServerConfig } = require('../db/database');

function maskKey(key) {
  if (!key || key.length <= 7) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Show current server provider configuration')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guildId) {
      return interaction.reply({ content: '⚠️ This command must be used in a server.', ephemeral: true });
    }

    const config = getServerConfig(interaction.guildId);
    if (!config) {
      return interaction.reply({
        content: 'ℹ️ No configuration found for this server. Run `/setup` first.',
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `Provider: **${config.provider}**\nAPI Key: **${maskKey(config.api_key)}**`,
      ephemeral: true,
    });
  },
};
