import { describe, expect, it } from 'vitest';

describe('domain package', () => {
  it('provides a portable identifier type', () => {
    const id = 'foundation' as import('../src').DomainIdentifier;
    expect(id).toBe('foundation');
  });
});
