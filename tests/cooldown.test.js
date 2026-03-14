/**
 * Tests for utils/cooldown.js
 *
 * This file demonstrates:
 *  - How to use Jest's fake timer APIs (jest.useFakeTimers) to control time
 *  - How to test stateful in-memory utilities by isolating module state
 *    between tests with jest.resetModules()
 */

// Reset the module registry before each test so each test gets a fresh
// `lastUsed` Map (the module-level state inside cooldown.js).
let checkCooldown;
let setCooldown;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  ({ checkCooldown, setCooldown } = require('../utils/cooldown'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('checkCooldown', () => {
  it('returns 0 for a user who has never used the command', () => {
    expect(checkCooldown('user-1', 30)).toBe(0);
  });

  it('returns a positive number immediately after the command is used', () => {
    setCooldown('user-1');
    expect(checkCooldown('user-1', 30)).toBeGreaterThan(0);
  });

  it('returns 0 after the cooldown period has elapsed', () => {
    setCooldown('user-1');

    // Advance fake time by 31 seconds (past the 30-second cooldown)
    jest.advanceTimersByTime(31_000);

    expect(checkCooldown('user-1', 30)).toBe(0);
  });

  it('still enforces a cooldown while time is still within the window', () => {
    setCooldown('user-1');

    // Advance fake time by 20 seconds (still within the 30-second cooldown)
    jest.advanceTimersByTime(20_000);

    expect(checkCooldown('user-1', 30)).toBeGreaterThan(0);
  });

  it('does not affect cooldowns for different users independently', () => {
    setCooldown('user-A');

    // user-B has never used the command — should have no cooldown
    expect(checkCooldown('user-B', 30)).toBe(0);
    // user-A should still be on cooldown
    expect(checkCooldown('user-A', 30)).toBeGreaterThan(0);
  });
});

describe('setCooldown', () => {
  it('records the timestamp so a subsequent checkCooldown sees the cooldown', () => {
    expect(checkCooldown('user-1', 30)).toBe(0);
    setCooldown('user-1');
    expect(checkCooldown('user-1', 30)).toBeGreaterThan(0);
  });

  it('resets an existing cooldown when called again', () => {
    setCooldown('user-1');

    // Advance almost to the end of the cooldown window
    jest.advanceTimersByTime(29_000);

    // User triggers the command again — cooldown resets
    setCooldown('user-1');

    // Should now be back to a full 30-second window
    expect(checkCooldown('user-1', 30)).toBeGreaterThan(25);
  });
});
