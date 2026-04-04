function validateEnv() {
  const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variable(s): ${missing.join(', ')}\n` +
        'Please create .env and fill in all values.',
    );
  }
}

module.exports = { validateEnv };
