import { GREETINGS_LIST, getRandomGreeting } from '../greetings';

describe('Greetings Service', () => {
  it('contains at least 30 unique romantic/cute greetings', () => {
    expect(GREETINGS_LIST.length).toBeGreaterThanOrEqual(30);
    const unique = new Set(GREETINGS_LIST);
    expect(unique.size).toBe(GREETINGS_LIST.length);
  });

  it('never returns consecutive duplicate greetings over 100 iterations', () => {
    let lastIndex = -1;
    for (let i = 0; i < 100; i++) {
      const { greeting, index } = getRandomGreeting(lastIndex);
      expect(index).not.toBe(lastIndex);
      expect(typeof greeting).toBe('string');
      expect(greeting.length).toBeGreaterThan(0);
      lastIndex = index;
    }
  });
});
