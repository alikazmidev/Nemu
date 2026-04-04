const { SlashCommandBuilder } = require('discord.js');
const { getServerConfig } = require('../db/database');
const { formatMessagesForLLM } = require('../utils/messageParser');
const { summarizeWithProvider } = require('../utils/providers');
const { getCooldownRemainingMinutes, setChannelCooldown } = require('../utils/cooldown');

const MAX_COUNT = 100;
const DEFAULT_COUNT = 50;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tldr')
    .setDescription('Summarize recent channel messages')
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setDescription('How many recent messages to summarize (default 50, max 100)')
        .setMinValue(1)
        .setMaxValue(MAX_COUNT)
        .setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guildId || !interaction.channel) {
      return interaction.reply({
        content: '⚠️ This command can only be used in a server text channel.',
        ephemeral: true,
      });
    }

    const remainingMinutes = getCooldownRemainingMinutes(interaction.channelId);
    if (remainingMinutes > 0) {
      return interaction.reply({
        content: `⏳ TLDR is on cooldown. Try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`,
      });
    }

    const serverConfig = getServerConfig(interaction.guildId);
    if (!serverConfig) {
      return interaction.reply({
        content: '❌ No API key is configured for this server. An admin must run `/setup` first.',
      });
    }

    const count = interaction.options.getInteger('count') ?? DEFAULT_COUNT;

    await interaction.deferReply();

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: count });
      const messages = Array.from(fetched.values()).reverse().filter((m) => !m.author.bot);

      if (messages.length === 0) {
        return interaction.editReply('📭 No non-bot messages found to summarize.');
      }

      const formatted = formatMessagesForLLM(messages, serverConfig.provider);
      if (!formatted) {
        return interaction.editReply('📭 No supported message content found to summarize.');
      }

      const summary = await summarizeWithProvider({
        provider: serverConfig.provider,
        apiKey: serverConfig.api_key,
        messages: formatted,
      });

      setChannelCooldown(interaction.channelId);
      return interaction.editReply(summary.slice(0, 2000));
    } catch (error) {
      const message = String(error?.message || '');

      if (message.includes('PROVIDER_NOT_FOUND')) {
        return interaction.editReply('❌ Configured provider is not supported. Ask an admin to run `/setup` again.');
      }

      if (message.includes('401') || message.includes('403') || message.toLowerCase().includes('invalid')) {
        return interaction.editReply('❌ The configured API key appears invalid. Ask an admin to run `/setup` again.');
      }

      return interaction.editReply('⚠️ Failed to generate TLDR right now. Please try again later.');
    }
  },
};
