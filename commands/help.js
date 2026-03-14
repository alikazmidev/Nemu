const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands and how to use Nemu'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2) // Discord blurple
      .setTitle('🤖 Nemu — Help')
      .setDescription(
        'Nemu is a Discord bot that summarizes channel conversations using AI.\n' +
          'Run the commands below in any text channel or thread to get started.',
      )
      .addFields(
        {
          name: '`/summarize`',
          value:
            'Summarize the recent messages in this channel or thread.\n' +
            '• **limit** — how many messages to read (50 / 100 / 250)\n' +
            '• **hours** — how far back to look (1 / 2 / 3 hours)\n' +
            '_Whichever limit is reached first wins._',
        },
        {
          name: '`/help`',
          value: 'Show this help message.',
        },
        {
          name: '⏳ Cooldown',
          value: 'Each user must wait **30 seconds** between `/summarize` calls.',
        },
        {
          name: '📚 Learn more',
          value: '[GitHub Repository](https://github.com/alikazmidev/Nemu)',
        },
      )
      .setFooter({ text: 'Named after Nemu Kurotsuchi from the anime Bleach ✨' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
