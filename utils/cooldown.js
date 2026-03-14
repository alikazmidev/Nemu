/**
 * Simple per-user cooldown system.
 *
 * Why this matters:
 *   Without rate limiting a single user could spam /summarize and rack up
 *   large API bills in seconds.  We store the last-used timestamp for each
 *   user in a plain JavaScript Map (in-process memory) — no database required
 *   for a small bot.
 *
 * Usage:
 *   const { checkCooldown, setCooldown } = require('./cooldown');
 *
 *   const remaining = checkCooldown(userId, 30); // 30-second window
 *   if (remaining > 0) {
 *     return interaction.reply(`⏳ Please wait ${remaining}s before using this command again.`);
 *   }
 *   setCooldown(userId);
 */

// Map<userId: string, lastUsedAt: number (ms timestamp)>
const lastUsed = new Map();

/**
 * Returns the number of seconds remaining in the cooldown period.
 * Returns 0 when the user is free to run the command again.
 *
 * @param {string} userId - Discord user ID.
 * @param {number} cooldownSeconds - How long the cooldown lasts in seconds.
 * @returns {number} Seconds remaining, or 0 if the cooldown has expired.
 */
function checkCooldown(userId, cooldownSeconds) {
  if (!lastUsed.has(userId)) return 0;

  const elapsed = (Date.now() - lastUsed.get(userId)) / 1000;
  const remaining = cooldownSeconds - elapsed;
  return remaining > 0 ? Math.ceil(remaining) : 0;
}

/**
 * Records the current timestamp for the given user, starting their cooldown.
 *
 * @param {string} userId - Discord user ID.
 */
function setCooldown(userId) {
  lastUsed.set(userId, Date.now());
}

module.exports = { checkCooldown, setCooldown };
