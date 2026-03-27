import { z } from 'zod';

export const FileAttachmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().nonnegative(),
  dataUrl: z.string().min(1),
});

export type FileAttachment = z.infer<typeof FileAttachmentSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  sentTimestamp: z.coerce.date(),
  receivedTimestamp: z.coerce.date().optional(),
  readTimestamp: z.coerce.date().optional(),
  textContent: z.string(),
  attachments: z.array(FileAttachmentSchema).optional(),
});

export type Message = z.infer<typeof MessageSchema>;
