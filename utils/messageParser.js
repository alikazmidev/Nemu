function isGifAttachment(attachment) {
  const name = String(attachment?.name || '').toLowerCase();
  const url = String(attachment?.url || '').toLowerCase();
  return name.endsWith('.gif') || url.endsWith('.gif');
}

function isImageAttachment(attachment) {
  const contentType = String(attachment?.contentType || '').toLowerCase();
  if (contentType.startsWith('image/')) return true;

  const name = String(attachment?.name || '').toLowerCase();
  const url = String(attachment?.url || '').toLowerCase();
  return /\.(png|jpe?g|webp|bmp|svg|gif)(\?|$)/.test(name) || /\.(png|jpe?g|webp|bmp|svg|gif)(\?|$)/.test(url);
}

function parseSingleMessage(message, visionSupported) {
  const parts = [];

  const text = String(message.content || '').trim();
  if (text) parts.push(text);

  for (const embed of message.embeds || []) {
    const title = String(embed?.title || '').trim();
    const description = String(embed?.description || '').trim();

    if (title || description) {
      const embedPart = [title, description].filter(Boolean).join(' — ');
      parts.push(`[embed] ${embedPart}`);
    }
  }

  for (const attachment of message.attachments?.values?.() || []) {
    if (isGifAttachment(attachment)) {
      parts.push('[GIF]');
      continue;
    }

    if (isImageAttachment(attachment)) {
      if (visionSupported && attachment.url) {
        parts.push(`[image] ${attachment.url}`);
      } else {
        parts.push('[image]');
      }
    }
  }

  if (parts.length === 0) return null;

  return `${message.author.username}: ${parts.join(' | ')}`;
}

function formatMessagesForLLM(messages, provider) {
  const normalizedProvider = String(provider || '').toLowerCase();
  const visionSupportedProviders = new Set(['openai', 'anthropic']);
  const visionSupported = visionSupportedProviders.has(normalizedProvider);

  return messages
    .filter((m) => !m.author?.bot)
    .map((m) => parseSingleMessage(m, visionSupported))
    .filter(Boolean)
    .join('\n');
}

module.exports = {
  formatMessagesForLLM,
};
