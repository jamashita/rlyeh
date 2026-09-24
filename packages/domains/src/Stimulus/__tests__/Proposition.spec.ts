import { Proposition } from '../Proposition.js';

describe('Proposition', () => {
  describe('ID', () => {
    it.each`
      value     | expected
      ${'p01'}  | ${true}
      ${'p99'}  | ${true}
      ${'p1'}   | ${false}
      ${'p001'} | ${false}
      ${'q01'}  | ${false}
      ${''}     | ${false}
    `('returns $expected for $value', ({ value, expected }: { value: string; expected: boolean }) => {
      expect(Proposition.ID.schema.safeParse(value).success).toBe(expected);
    });
  });

  describe('schema', () => {
    it('accepts an id and a summary', () => {
      expect(Proposition.schema.safeParse({ id: 'p01', summary: 'A woman found the object' }).success).toBe(true);
    });

    it.each`
      value
      ${{ id: 'p01', summary: '' }}
      ${{ id: 'p01' }}
      ${{ id: 'x01', summary: 'A woman found the object' }}
    `('rejects $value', ({ value }: { value: unknown }) => {
      expect(Proposition.schema.safeParse(value).success).toBe(false);
    });
  });
});
