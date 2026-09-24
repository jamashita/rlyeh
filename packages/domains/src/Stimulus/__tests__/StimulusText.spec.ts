import { StimulusText } from '../StimulusText.js';

describe('StimulusText', () => {
  describe('parse', () => {
    it('keeps a text without markers as it is', () => {
      expect(StimulusText.parse('no markers here.')).toStrictEqual({
        _tag: 'Right',
        right: { plain: 'no markers here.', spans: [] }
      });
    });

    it('removes the markers and records where each proposition is written', () => {
      expect(StimulusText.parse('{p01:ab}c{p02:d}e')).toStrictEqual({
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

    it('records the spans in the order they appear, not by id', () => {
      expect(StimulusText.parse('{p03:倒れた木のそばで}、{p04:四つの白い円}を{p02:発見した}。')).toStrictEqual({
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
      expect(StimulusText.parse('{p01:が}{p02:👨‍👩‍👧}x')).toStrictEqual({
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

    it('allows text that belongs to no proposition between markers', () => {
      expect(StimulusText.parse('Before {p01:it}, after.')).toStrictEqual({
        _tag: 'Right',
        right: { plain: 'Before it, after.', spans: [{ proposition: 'p01', start: 7, end: 9 }] }
      });
    });

    it.each`
      marked               | reason
      ${'{p01:a{p02:b}c}'} | ${'nested marker'}
      ${'{p01:abc'}        | ${'unclosed marker'}
      ${'abc}'}            | ${'stray closing brace'}
      ${'{px:a}'}          | ${'malformed proposition id'}
      ${'{p1:a}'}          | ${'proposition id without two digits'}
    `('rejects a $reason', ({ marked }: { marked: string }) => {
      expect(StimulusText.parse(marked)).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: 'the text has a brace that is not part of a {pNN:…} marker' }
      });
    });

    it('rejects a proposition marked more than once', () => {
      expect(StimulusText.parse('{p01:a}b{p01:c}')).toStrictEqual({
        _tag: 'Left',
        left: { error: 'ParseError', message: 'proposition p01 is marked more than once' }
      });
    });
  });
});
