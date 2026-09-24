import { z } from 'zod';

const PropositionIDSchema = z
  .string()
  .regex(/^p\d{2}$/)
  .brand<'PropositionID'>();

/**
 * `p01`, `p02` and so on.
 */
export type PropositionID = z.infer<typeof PropositionIDSchema>;

/**
 * A fact stated in the text, shared by every language. `summary` is a note for
 * whoever writes and reviews the stimulus; the program does not use it.
 */
const PropositionSchema = z
  .object({
    id: PropositionIDSchema,
    summary: z.string().min(1)
  })
  .readonly();

export type Proposition = z.infer<typeof PropositionSchema>;

export const Proposition = {
  schema: PropositionSchema,

  ID: {
    schema: PropositionIDSchema
  }
} as const;
