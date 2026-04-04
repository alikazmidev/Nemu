const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { upsertServerConfig } = require('../db/database');

function maskKey(key) {
  if (!key || key.length <= 7) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configure provider and API key for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName('api_key').setDescription('Provider API key for this server').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('provider')
        .setDescription('LLM provider')
        .addChoices({ name: 'deepseek', value: 'deepseek' })
        .setRequired(true),
    ),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guildId) {
      return interaction.reply({ content: '⚠️ This command must be used in a server.', ephemeral: true });
    }

    const apiKey = interaction.options.getString('api_key', true).trim();
    const provider = interaction.options.getString('provider', true).trim().toLowerCase();

    upsertServerConfig(interaction.guildId, provider, apiKey);

    return interaction.reply({
      content: `✅ Configuration saved. Provider: **${provider}** | API Key: **${maskKey(apiKey)}**`,
      ephemeral: true,
    });
  },
};
