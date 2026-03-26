import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  sentTimestamp: z.coerce.date(),
  receivedTimestamp: z.coerce.date().optional(),
  readTimestamp: z.coerce.date().optional(),
  textContent: z.string().min(1),
});

export type Message = z.infer<typeof MessageSchema>;
