import { z } from 'zod';
import { Question } from './Question.js';
import { StimulusText } from './StimulusText.js';

/**
 * Everything a stimulus shows in one language.
 *
 * - `text` is the marked text, parsed into what is shown and where each
 *   proposition is written.
 * - `notInText` is how "the text does not say" is worded.
 * - `questions` words each question and its options.
 *
 * Whether it covers exactly the stimulus' questions and options is checked with
 * the whole stimulus.
 */
const StimulusLocaleSchema = z
  .object({
    text: StimulusText.schema,
    notInText: z.string().min(1),
    questions: z.record(
      Question.ID.schema,
      z
        .object({
          prompt: z.string().min(1),
          options: z.record(Question.OptionID.schema, z.string().min(1)).readonly()
        })
        .readonly()
    )
  })
  .readonly();

export type StimulusLocale = z.infer<typeof StimulusLocaleSchema>;

export const StimulusLocale = {
  schema: StimulusLocaleSchema
} as const;
