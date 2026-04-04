let getCooldownRemainingMinutes;
let setChannelCooldown;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  ({ getCooldownRemainingMinutes, setChannelCooldown } = require('../utils/cooldown'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('channel cooldown', () => {
  it('returns 0 for a channel with no cooldown', () => {
    expect(getCooldownRemainingMinutes('channel-1')).toBe(0);
  });

  it('returns a positive minute value immediately after setting cooldown', () => {
    setChannelCooldown('channel-1');
    expect(getCooldownRemainingMinutes('channel-1')).toBeGreaterThan(0);
  });

  it('expires after 10 minutes', () => {
    setChannelCooldown('channel-1');
    jest.advanceTimersByTime(10 * 60 * 1000 + 1000);
    expect(getCooldownRemainingMinutes('channel-1')).toBe(0);
  });

  it('is tracked per-channel independently', () => {
    setChannelCooldown('channel-A');
    expect(getCooldownRemainingMinutes('channel-B')).toBe(0);
    expect(getCooldownRemainingMinutes('channel-A')).toBeGreaterThan(0);
  });
});
