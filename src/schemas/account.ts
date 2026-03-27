import {z} from 'zod';

export const AccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().nullable().optional(),
  privateKey: z.string().nullable().optional(),
});

export type Account = z.infer<typeof AccountSchema>;
