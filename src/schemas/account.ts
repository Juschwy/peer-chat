import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  privateKey: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;
