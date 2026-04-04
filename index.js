require('dotenv').config();
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { validateEnv } = require('./utils/validateEnv');
const tldrCommand = require('./commands/tldr');
const setupCommand = require('./commands/setup');
const configCommand = require('./commands/config');
const removeCommand = require('./commands/remove');

validateEnv();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const commands = [tldrCommand, setupCommand, configCommand, removeCommand];
client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`✅ Nemu is online as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, error);

    const payload = {
      content: '⚠️ Something went wrong while processing your request. Please try again later.',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
