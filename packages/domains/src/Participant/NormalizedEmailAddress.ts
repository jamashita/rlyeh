import type { EmailAddress } from '@rlyeh/lib/EmailAddress';
import { z } from 'zod';

const NormalizedEmailAddressSchema = z.email().brand<'NormalizedEmailAddress'>();

/**
 * The key used to tell whether two email addresses reach the same inbox, so one
 * person cannot register twice through an alias (AGENTS.md §14.7). It is only
 * compared, never sent to: mail always goes to the address as it was entered.
 */
export type NormalizedEmailAddress = z.infer<typeof NormalizedEmailAddressSchema>;

const GMAIL_DOMAINS: ReadonlyArray<string> = ['gmail.com', 'googlemail.com'];

const splitAt = (email: string): readonly [string, string] => {
  const at = email.lastIndexOf('@');

  return [email.slice(0, at), email.slice(at + 1)];
};

/**
 * A local part that starts with `+` has nothing before the subaddress, and
 * removing it would leave an empty local part, so it is kept as it is.
 */
const removeSubaddress = (local: string): string => {
  const plus = local.indexOf('+');

  if (plus <= 0) {
    return local;
  }

  return local.slice(0, plus);
};

const normalizeGmail = (local: string): readonly [string, string] => {
  return [local.replaceAll('.', ''), 'gmail.com'];
};

export const NormalizedEmailAddress = {
  schema: NormalizedEmailAddressSchema,

  /**
   * - Lowercase the whole address.
   * - Drop everything after `+` in the local part.
   * - For Gmail, drop `.` in the local part and treat `googlemail.com` as `gmail.com`.
   */
  from: (email: EmailAddress): NormalizedEmailAddress => {
    const [local, domain] = splitAt(email.toLowerCase());
    const withoutSubaddress = removeSubaddress(local);

    if (GMAIL_DOMAINS.includes(domain)) {
      const [gmailLocal, gmailDomain] = normalizeGmail(withoutSubaddress);

      return NormalizedEmailAddressSchema.parse(`${gmailLocal}@${gmailDomain}`);
    }

    return NormalizedEmailAddressSchema.parse(`${withoutSubaddress}@${domain}`);
  }
} as const;
