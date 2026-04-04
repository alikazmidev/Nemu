const deepseek = require('./deepseek');

const PROVIDERS = {
  deepseek: {
    adapter: deepseek,
    supportsVision: false,
  },
  openai: {
    adapter: null,
    supportsVision: true,
  },
  anthropic: {
    adapter: null,
    supportsVision: true,
  },
};

async function summarizeWithProvider({ provider, apiKey, messages }) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  const providerEntry = PROVIDERS[normalizedProvider];
  const adapter = providerEntry?.adapter;

  if (!adapter || typeof adapter.summarize !== 'function') {
    throw new Error('PROVIDER_NOT_FOUND');
  }

  return adapter.summarize(apiKey, messages);
}

function isVisionSupported(provider) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  return Boolean(PROVIDERS[normalizedProvider]?.supportsVision);
}

module.exports = {
  summarizeWithProvider,
  isVisionSupported,
  SUPPORTED_PROVIDER_NAMES: Object.keys(PROVIDERS).filter((name) => PROVIDERS[name].adapter !== null),
};
