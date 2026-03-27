import {z} from 'zod';

export const ContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nickname: z.string().optional(),
  avatar: z.string().nullable().optional(),
  publicKey: z.string(),
});

export type Contact = z.infer<typeof ContactSchema>;
