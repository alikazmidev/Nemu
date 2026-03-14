const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

/**
 * Sends the collected thread messages to the DeepSeek API and returns
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

  const systemPrompt = `You are Nemu, a witty Discord bot assistant (named after the character from the anime Bleach) with a sharp sense of humor and great social awareness.
Your job is to read a Discord conversation and write a summary that genuinely captures what happened — the topics, the energy, the jokes, the drama, the chaos, all of it.
Write as if you are a friend who was there and is now telling another friend what they missed. Be casual, funny when the chat was funny, dramatic when it was dramatic, and real.
Write in flowing prose — no bullet points, no headers, no lists. Just one or a few paragraphs that read naturally like a story or a message from a friend.
Preserve the vibe and personality of the conversation. If people were roasting each other, say so. If someone said something dumb, you can gently call it out. If there was hype, bring the hype.
Keep it concise but vivid — the reader should feel like they were actually there.`;

  const userPrompt = `Hey Nemu, ${requestedByUsername} missed this conversation and wants to know what went down. Give them the full rundown:\n\n${transcript}`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Unexpected response structure from DeepSeek API.');
  }

  return content.trim();
}

module.exports = { summarizeMessages };
