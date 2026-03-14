require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const summarizeCommand = require('./commands/summarize');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.commands.set(summarizeCommand.data.name, summarizeCommand);

client.once('ready', async () => {
  console.log(`✅ Nemu is online as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [summarizeCommand.data.toJSON()],
    });
    console.log('✅ Slash commands registered globally.');
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error executing command "${interaction.commandName}":`, error);
    const errorMessage = {
      content: '⚠️ Something went wrong while processing your request. Please try again later.',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
