import { z } from 'zod';
import { Question } from './Question.js';
import { StimulusText } from './StimulusText.js';

const QuestionWordingSchema = z
  .object({
    prompt: z.string().min(1),
    options: z.record(Question.OptionID.schema, z.string().min(1)).readonly()
  })
  .readonly();

/**
 * Everything a stimulus shows in one language.
 *
 * In a stimulus file it is written as
 * - `text`: the text as the participant reads it;
 * - `spans`: for each proposition, the part of `text` that states it;
 * - `notInText`: how "the text does not say" is worded;
 * - `questions`: how each question and its options are worded.
 *
 * `text` and `spans` are read together into a `StimulusText`, which gives where
 * each proposition is written. Whether the locale covers exactly the stimulus'
 * propositions, questions and options is checked with the whole stimulus.
 */
const StimulusLocaleSchema = z
  .object({
    text: z.string(),
    spans: z.record(z.string(), z.string()),
    notInText: z.string(),
    questions: z.record(z.string(), z.unknown())
  })
  .transform(({ text, spans, ...rest }) => {
    return { ...rest, text: { text, spans } };
  })
  .pipe(
    z
      .object({
        text: StimulusText.schema,
        notInText: z.string().min(1),
        questions: z.record(Question.ID.schema, QuestionWordingSchema)
      })
      .readonly()
  );

export type StimulusLocale = z.infer<typeof StimulusLocaleSchema>;

export const StimulusLocale = {
  schema: StimulusLocaleSchema
} as const;
