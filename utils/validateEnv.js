/**
 * Validates that all required environment variables are set before the bot starts.
 *
 * Why this matters:
 *   Without this check the bot would start and then crash with a cryptic error
 *   the first time it tries to use a missing variable (e.g. on the first API call).
 *   Failing fast at startup with a clear message saves a lot of debugging time.
 *
 * @throws {Error} If any required variable is missing.
 */
function validateEnv() {
  const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'DEEPSEEK_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variable(s): ${missing.join(', ')}\n` +
        'Please copy .env.example to .env and fill in all values.',
    );
  }
}

module.exports = { validateEnv };
