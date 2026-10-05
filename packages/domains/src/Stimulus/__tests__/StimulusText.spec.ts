import { StimulusText } from '../StimulusText.js';

const expectFailure = (value: unknown, message: string): void => {
  expect(StimulusText.parse(value)).toStrictEqual({ _tag: 'Left', left: { error: 'ParseError', message } });
};

describe('StimulusText', () => {
  describe('parse', () => {
    it('keeps the text as it is and records where each quote is written', () => {
      expect(StimulusText.parse({ text: 'abcde', spans: { p01: 'ab', p02: 'd' } })).toStrictEqual({
        _tag: 'Right',
        right: {
          plain: 'abcde',
          spans: [
            { proposition: 'p01', start: 0, end: 2 },
            { proposition: 'p02', start: 3, end: 4 }
          ]
        }
      });
    });

    it('records the spans in the order they appear in the text, not in the order they are listed', () => {
      expect(
        StimulusText.parse({
          text: '倒れた木のそばで、四つの白い円を発見した。',
          spans: { p02: '発見した', p03: '倒れた木のそばで', p04: '四つの白い円' }
        })
      ).toStrictEqual({
        _tag: 'Right',
        right: {
          plain: '倒れた木のそばで、四つの白い円を発見した。',
          spans: [
            { proposition: 'p03', start: 0, end: 8 },
            { proposition: 'p04', start: 9, end: 15 },
            { proposition: 'p02', start: 16, end: 20 }
          ]
        }
      });
    });

    it('counts in graphemes, so a combined character counts as one', () => {
      // "か" + combining voiced sound mark, and a family emoji built from several code points
      expect(StimulusText.parse({ text: 'が👨‍👩‍👧x', spans: { p01: 'が', p02: '👨‍👩‍👧' } })).toStrictEqual({
        _tag: 'Right',
        right: {
          plain: 'が👨‍👩‍👧x',
          spans: [
            { proposition: 'p01', start: 0, end: 1 },
            { proposition: 'p02', start: 1, end: 2 }
          ]
        }
      });
    });

    it('allows text that no quote covers', () => {
      expect(StimulusText.parse({ text: 'Before it, after.', spans: { p01: 'it' } })).toStrictEqual({
        _tag: 'Right',
        right: { plain: 'Before it, after.', spans: [{ proposition: 'p01', start: 7, end: 9 }] }
      });
    });

    it('fails when a quote is not in the text', () => {
      expectFailure({ text: 'abcde', spans: { p01: 'xyz' } }, 'the quote of p01 is not in the text');
    });

    it('fails when a quote appears more than once', () => {
      expectFailure({ text: 'the key and the key', spans: { p01: 'the key' } }, 'the quote of p01 appears more than once; quote a longer part');
    });

    it('fails when a quote overlaps itself', () => {
      expectFailure({ text: 'aaa', spans: { p01: 'aa' } }, 'the quote of p01 appears more than once; quote a longer part');
    });

    it('fails when two quotes overlap', () => {
      expectFailure({ text: 'abcde', spans: { p01: 'abc', p02: 'cde' } }, 'the quotes of p01 and p02 overlap');
    });

    it.each`
      value
      ${{ text: '', spans: {} }}
      ${{ text: 'abc', spans: { x01: 'a' } }}
      ${{ text: 'abc', spans: { p01: '' } }}
      ${'{p01:abc}'}
    `('fails on a malformed value: $value', ({ value }: { value: unknown }) => {
      expect(StimulusText.parse(value)).toMatchObject({ _tag: 'Left', left: { error: 'ParseError' } });
    });
  });
});
