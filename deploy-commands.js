require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { validateEnv } = require('./utils/validateEnv');
const tldrCommand = require('./commands/tldr');
const setupCommand = require('./commands/setup');
const configCommand = require('./commands/config');
const removeCommand = require('./commands/remove');

validateEnv();

const commands = [tldrCommand, setupCommand, configCommand, removeCommand].map((cmd) => cmd.data.toJSON());

async function deploy() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands,
  });

  console.log('✅ Slash commands deployed successfully.');
}

deploy().catch((error) => {
  console.error('❌ Failed to deploy slash commands:', error);
  process.exit(1);
});
