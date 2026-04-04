const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

async function summarize(apiKey, formattedMessages) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Summarize the Discord conversation in clear bullet points. Keep it concise and useful. Write in the same language used in the conversation.',
        },
        {
          role: 'user',
          content: `Conversation to summarize:\n\n${formattedMessages}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Unexpected DeepSeek response format.');
  }

  return content.trim();
}

module.exports = { summarize };
