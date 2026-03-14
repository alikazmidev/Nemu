const { SlashCommandBuilder } = require('discord.js');
const { fetchThreadMessages } = require('../utils/messageHandler');
const { summarizeMessages } = require('../utils/llmIntegration');
const { checkCooldown, setCooldown } = require('../utils/cooldown');

const COOLDOWN_SECONDS = 30;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summarize')
    .setDescription('Summarize the recent messages in this thread')
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('Maximum number of messages to include')
        .setRequired(true)
        .addChoices(
          { name: '50 messages', value: 50 },
          { name: '100 messages', value: 100 },
          { name: '250 messages', value: 250 },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('hours')
        .setDescription('Only include messages from the last X hours')
        .setRequired(true)
        .addChoices(
          { name: '1 hour', value: 1 },
          { name: '2 hours', value: 2 },
          { name: '3 hours', value: 3 },
        ),
    ),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel) {
      return interaction.reply({
        content: '⚠️ This command can only be used inside a server channel.',
        ephemeral: true,
      });
    }

    if (!channel.isThread()) {
      return interaction.reply({
        content: '⚠️ This command can only be used inside a thread.',
        ephemeral: true,
      });
    }

    // Cooldown check — done before deferring so the ephemeral reply is instant
    const remaining = checkCooldown(interaction.user.id, COOLDOWN_SECONDS);
    if (remaining > 0) {
      return interaction.reply({
        content: `⏳ Please wait **${remaining} second(s)** before using \`/summarize\` again.`,
        ephemeral: true,
      });
    }

    const limit = interaction.options.getInteger('limit');
    const hours = interaction.options.getInteger('hours');

    await interaction.deferReply();

    // Record the cooldown now that we've committed to running the command
    setCooldown(interaction.user.id);

    let messages;
    try {
      messages = await fetchThreadMessages(channel, limit, hours);
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      return interaction.editReply(
        '⚠️ Failed to fetch messages from this thread. Please check my permissions and try again.',
      );
    }

    if (messages.length === 0) {
      return interaction.editReply(
        `📭 No messages found in the last ${hours} hour(s) or within the last ${limit} messages (excluding bot messages).`,
      );
    }

    let summary;
    try {
      summary = await summarizeMessages(messages, interaction.user.username);
    } catch (error) {
      console.error('❌ Failed to generate summary:', error);
      return interaction.editReply(
        '⚠️ Failed to generate a summary. The AI service may be temporarily unavailable. Please try again later.',
      );
    }

    const requestedBy = `**Requested by:** <@${interaction.user.id}>`;
    const fullSummary = `${summary}\n\n${requestedBy}`;

    if (fullSummary.length > 2000) {
      const chunks = splitMessage(fullSummary, 2000);
      await interaction.editReply(chunks[0]);
      for (let i = 1; i < chunks.length; i++) {
        await channel.send(chunks[i]);
      }
    } else {
      await interaction.editReply(fullSummary);
    }
  },
};

function splitMessage(text, maxLength) {
  const chunks = [];
  while (text.length > maxLength) {
    let splitAt = text.lastIndexOf('\n', maxLength);
    if (splitAt === -1) splitAt = maxLength;
    chunks.push(text.slice(0, splitAt));
    text = text.slice(splitAt).trimStart();
  }
  if (text.length > 0) chunks.push(text);
  return chunks;
}
