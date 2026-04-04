const deepseek = require('./deepseek');

const adapters = {
  deepseek,
};

async function summarizeWithProvider({ provider, apiKey, messages }) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  const adapter = adapters[normalizedProvider];

  if (!adapter || typeof adapter.summarize !== 'function') {
    throw new Error('PROVIDER_NOT_FOUND');
  }

  return adapter.summarize(apiKey, messages);
}

module.exports = {
  summarizeWithProvider,
};
