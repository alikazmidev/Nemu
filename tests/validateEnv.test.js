/**
 * Tests for utils/validateEnv.js
 *
 * This file demonstrates:
 *  - How to mock process.env in Jest without leaking state between tests
 *  - How to write tests for functions that throw on bad input
 */

const { validateEnv } = require('../utils/validateEnv');

// Save the original env so we can restore it after each test
const originalEnv = process.env;

beforeEach(() => {
  // Start each test with a fresh copy of process.env
  process.env = { ...originalEnv };
});

afterEach(() => {
  // Restore the real process.env so no test can pollute another
  process.env = originalEnv;
});

describe('validateEnv', () => {
  it('does not throw when all required variables are set', () => {
    process.env.DISCORD_TOKEN = 'token';
    process.env.CLIENT_ID = 'client-id';
    process.env.OPENROUTER_API_KEY = 'api-key';

    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when DISCORD_TOKEN is missing', () => {
    delete process.env.DISCORD_TOKEN;
    process.env.CLIENT_ID = 'client-id';
    process.env.OPENROUTER_API_KEY = 'api-key';

    expect(() => validateEnv()).toThrow('DISCORD_TOKEN');
  });

  it('throws when CLIENT_ID is missing', () => {
    process.env.DISCORD_TOKEN = 'token';
    delete process.env.CLIENT_ID;
    process.env.OPENROUTER_API_KEY = 'api-key';

    expect(() => validateEnv()).toThrow('CLIENT_ID');
  });

  it('throws when OPENROUTER_API_KEY is missing', () => {
    process.env.DISCORD_TOKEN = 'token';
    process.env.CLIENT_ID = 'client-id';
    delete process.env.OPENROUTER_API_KEY;

    expect(() => validateEnv()).toThrow('OPENROUTER_API_KEY');
  });

  it('lists all missing variables in the error message when multiple are absent', () => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.CLIENT_ID;
    delete process.env.OPENROUTER_API_KEY;

    expect(() => validateEnv()).toThrow('DISCORD_TOKEN');
    expect(() => validateEnv()).toThrow('CLIENT_ID');
    expect(() => validateEnv()).toThrow('OPENROUTER_API_KEY');
  });
});
