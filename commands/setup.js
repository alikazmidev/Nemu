const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { upsertServerConfig } = require('../db/database');
const { SUPPORTED_PROVIDER_NAMES } = require('../utils/providers');

const MIN_MASKABLE_KEY_LENGTH = 7;

function maskKey(key) {
  if (!key || key.length <= MIN_MASKABLE_KEY_LENGTH) return '***';
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
    if (!SUPPORTED_PROVIDER_NAMES.includes(provider)) {
      return interaction.reply({
        content: '❌ Provider not supported right now. Supported provider: deepseek.',
        ephemeral: true,
      });
    }

    upsertServerConfig(interaction.guildId, provider, apiKey);

    return interaction.reply({
      content: `✅ Configuration saved. Provider: **${provider}** | API Key: **${maskKey(apiKey)}**`,
      ephemeral: true,
    });
  },
};
