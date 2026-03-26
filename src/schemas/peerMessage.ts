import { z } from 'zod';

export const PeerMessageType = z.enum([
  'PING_SEND',
  'PING_RECEIVE',
  'MESSAGE_SEND',
  'MESSAGE_RETURN_RECEIVED',
  'MESSAGE_RETURN_READ',
  'MESSAGE_RETURN_INVALID',
]);

export type PeerMessageType = z.infer<typeof PeerMessageType>;

export const PingContentSchema = z.object({
  peerId: z.string().min(1),
  name: z.string().min(1),
});

export type PingContent = z.infer<typeof PingContentSchema>;

export const PeerMessageSchema = z.object({
  type: PeerMessageType,
  content: z.unknown(),
});

export type PeerMessage = z.infer<typeof PeerMessageSchema>;
