import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string(),
  publicKey: z.string(),
});

export type Contact = z.infer<typeof ContactSchema>;
