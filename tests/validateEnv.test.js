const { validateEnv } = require('../utils/validateEnv');

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('validateEnv', () => {
  it('does not throw when all required variables are set', () => {
    process.env.DISCORD_TOKEN = 'token';
    process.env.CLIENT_ID = 'client-id';

    expect(() => validateEnv()).not.toThrow();
  });

  it('throws when DISCORD_TOKEN is missing', () => {
    delete process.env.DISCORD_TOKEN;
    process.env.CLIENT_ID = 'client-id';

    expect(() => validateEnv()).toThrow('DISCORD_TOKEN');
  });

  it('throws when CLIENT_ID is missing', () => {
    process.env.DISCORD_TOKEN = 'token';
    delete process.env.CLIENT_ID;

    expect(() => validateEnv()).toThrow('CLIENT_ID');
  });

  it('lists all missing variables in the error message when multiple are absent', () => {
    delete process.env.DISCORD_TOKEN;
    delete process.env.CLIENT_ID;

    expect(() => validateEnv()).toThrow('DISCORD_TOKEN');
    expect(() => validateEnv()).toThrow('CLIENT_ID');
  });
});
