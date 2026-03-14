const fetch = require('node-fetch');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';

/**
 * Sends the collected thread messages to Deepseek via OpenRouter and returns
 * a human-readable summary of the conversation.
 *
 * @param {Array<{author: string, content: string, timestamp: Date}>} messages
 * @param {string} requestedByUsername - The username of the person who ran /summarize.
 * @returns {Promise<string>} The summary text from the LLM.
 */
async function summarizeMessages(messages, requestedByUsername) {
  const transcript = messages
    .map((m) => `[${m.timestamp.toISOString()}] ${m.author}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are Nemu, a helpful Discord bot assistant (named after the character from the anime Bleach).
Your job is to read a thread conversation and provide a clear, engaging summary so that someone who missed the discussion can quickly understand what happened.
Write in a friendly, conversational tone. Highlight key topics, decisions, or events discussed.
If the conversation has lore, drama, or notable moments, make sure to capture that too.
Be concise but thorough. Use bullet points where appropriate.`;

  const userPrompt = `Please summarize the following Discord thread conversation for ${requestedByUsername}, who wants to catch up on what they missed:\n\n${transcript}`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://github.com/alikazmidev/Nemu',
      'X-Title': 'Nemu Discord Bot',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Unexpected response structure from OpenRouter API.');
  }

  return content.trim();
}

module.exports = { summarizeMessages };
