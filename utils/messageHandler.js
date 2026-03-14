/**
 * Fetches messages from a Discord thread, filtering out bot messages and,
 * optionally, messages older than the specified number of hours and/or
 * beyond the specified message count.
 *
 * @param {import('discord.js').ThreadChannel} thread - The thread channel to fetch from.
 * @param {number|null} limit - Maximum number of non-bot messages to collect, or null for no count limit (a safety ceiling of 500 is applied).
 * @param {number|null} hours - Only include messages from the last X hours, or null for no time filter.
 * @returns {Promise<Array<{author: string, content: string, timestamp: Date}>>}
 */
async function fetchThreadMessages(thread, limit, hours) {
  const cutoff = hours != null ? new Date(Date.now() - hours * 60 * 60 * 1000) : null;
  const effectiveLimit = limit != null ? limit : 500;
  const collected = [];
  let lastId = null;

  while (collected.length < effectiveLimit) {
    const fetchOptions = { limit: 100 };
    if (lastId) fetchOptions.before = lastId;

    const batch = await thread.messages.fetch(fetchOptions);
    if (batch.size === 0) break;

    let reachedCutoff = false;
    for (const message of batch.values()) {
      // Use `continue` (not `break`) so the entire batch is examined — this
      // ensures we never skip a human message that comes after a bot message
      // which is older than the cutoff, regardless of iteration order.
      if (cutoff && message.createdAt < cutoff) {
        reachedCutoff = true;
        continue;
      }
      if (message.author.bot) continue;
      if (!message.content || message.content.trim() === '') continue;

      collected.push({
        author: message.author.username,
        content: message.content,
        timestamp: message.createdAt,
      });

      if (collected.length >= effectiveLimit) break;
    }

    if (reachedCutoff || collected.length >= effectiveLimit) break;

    lastId = batch.last().id;
  }

  // Return messages in chronological order (oldest first)
  return collected.reverse();
}

module.exports = { fetchThreadMessages };
