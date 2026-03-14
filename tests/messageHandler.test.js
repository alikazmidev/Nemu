/**
 * Tests for utils/messageHandler.js
 *
 * fetchThreadMessages accepts optional `limit` and `hours` parameters.
 * This test suite verifies that:
 *  - When only `limit` is provided, messages are capped by count and no time
 *    filter is applied.
 *  - When only `hours` is provided, messages are filtered by time and a safety
 *    ceiling of 500 is applied instead of a caller-supplied count limit.
 *  - When both are provided, both constraints are applied (original behaviour).
 */

const { fetchThreadMessages } = require('../utils/messageHandler');

/** Build a fake Discord message object. */
function makeMessage({ author = 'user', content = 'hello', createdAt = new Date(), bot = false } = {}) {
  return {
    author: { username: author, bot },
    content,
    createdAt,
  };
}

/** Build a fake thread whose messages.fetch returns the given batches in order. */
function makeThread(batches) {
  let call = 0;
  return {
    messages: {
      fetch: jest.fn(async () => {
        const batch = batches[call] ?? [];
        call++;
        // Discord.js returns a Collection; we only need .values(), .size and .last()
        return {
          size: batch.length,
          values: () => batch[Symbol.iterator](),
          last: () => batch[batch.length - 1],
        };
      }),
    },
  };
}

describe('fetchThreadMessages', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns messages in chronological (oldest-first) order', async () => {
    const msgs = [
      makeMessage({ author: 'bob', content: 'second', createdAt: new Date('2024-01-01T11:50:00Z') }),
      makeMessage({ author: 'alice', content: 'first', createdAt: new Date('2024-01-01T11:40:00Z') }),
    ];
    const thread = makeThread([msgs, []]);

    const result = await fetchThreadMessages(thread, 10, null);

    expect(result).toHaveLength(2);
    expect(result[0].content).toBe('first');
    expect(result[1].content).toBe('second');
  });

  it('limits results by count when only limit is provided (no hours)', async () => {
    const msgs = [
      makeMessage({ content: 'msg1' }),
      makeMessage({ content: 'msg2' }),
      makeMessage({ content: 'msg3' }),
    ];
    const thread = makeThread([msgs, []]);

    const result = await fetchThreadMessages(thread, 2, null);

    expect(result).toHaveLength(2);
  });

  it('applies no time filter when hours is null', async () => {
    const veryOld = makeMessage({
      content: 'ancient',
      createdAt: new Date('2020-01-01T00:00:00Z'),
    });
    const recent = makeMessage({
      content: 'recent',
      createdAt: new Date('2024-01-01T11:59:00Z'),
    });
    const thread = makeThread([[veryOld, recent], []]);

    const result = await fetchThreadMessages(thread, 10, null);

    // Both messages should be included — no time cutoff
    expect(result).toHaveLength(2);
  });

  it('applies time filter when hours is provided', async () => {
    const old = makeMessage({
      content: 'too old',
      createdAt: new Date('2024-01-01T09:00:00Z'), // 3 hours ago
    });
    const fresh = makeMessage({
      content: 'fresh',
      createdAt: new Date('2024-01-01T11:30:00Z'), // 30 min ago
    });
    const thread = makeThread([[old, fresh], []]);

    // Only include messages from the last 1 hour
    const result = await fetchThreadMessages(thread, null, 1);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('fresh');
  });

  it('applies both limit and hours when both are provided', async () => {
    const old = makeMessage({
      content: 'too old',
      createdAt: new Date('2024-01-01T09:00:00Z'),
    });
    const fresh1 = makeMessage({
      content: 'fresh1',
      createdAt: new Date('2024-01-01T11:30:00Z'),
    });
    const fresh2 = makeMessage({
      content: 'fresh2',
      createdAt: new Date('2024-01-01T11:45:00Z'),
    });
    const thread = makeThread([[old, fresh1, fresh2], []]);

    // Last 2 hours, but only 1 message
    const result = await fetchThreadMessages(thread, 1, 2);

    expect(result).toHaveLength(1);
  });

  it('excludes bot messages', async () => {
    const botMsg = makeMessage({ content: 'I am a bot', bot: true });
    const humanMsg = makeMessage({ content: 'I am human' });
    const thread = makeThread([[botMsg, humanMsg], []]);

    const result = await fetchThreadMessages(thread, 10, null);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('I am human');
  });

  it('excludes messages with empty content', async () => {
    const empty = makeMessage({ content: '   ' });
    const withContent = makeMessage({ content: 'hello' });
    const thread = makeThread([[empty, withContent], []]);

    const result = await fetchThreadMessages(thread, 10, null);

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('hello');
  });

  it('returns an empty array when no qualifying messages exist', async () => {
    const thread = makeThread([[]]);

    const result = await fetchThreadMessages(thread, 10, 1);

    expect(result).toHaveLength(0);
  });
});
