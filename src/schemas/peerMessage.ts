import { z } from 'zod';
import { MessageSchema } from '@/schemas/message';
import { CallType } from '@/schemas/callRecord';

export const PeerMessageType = z.enum([
  'PING_SEND',
  'PING_RECEIVE',
  'MESSAGE_SEND',
  'MESSAGE_RETURN_RECEIVED',
  'MESSAGE_RETURN_READ',
  'MESSAGE_RETURN_INVALID',
  'CALL_OFFER',
  'CALL_ANSWER',
  'CALL_REJECT',
  'CALL_END',
]);

export type PeerMessageType = z.infer<typeof PeerMessageType>;

export const PingContentSchema = z.object({
  peerId: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().optional(),
});

export type PingContent = z.infer<typeof PingContentSchema>;

export const MessageReturnReceivedContentSchema = z.object({
  messageId: z.string().uuid(),
  receivedTimestamp: z.string(),
});

export type MessageReturnReceivedContent = z.infer<typeof MessageReturnReceivedContentSchema>;

export const MessageReturnReadContentSchema = z.object({
  messageId: z.string().uuid(),
  readTimestamp: z.string(),
});

export type MessageReturnReadContent = z.infer<typeof MessageReturnReadContentSchema>;

export const MessageReturnInvalidContentSchema = z.object({
  reason: z.string().optional(),
});

export type MessageReturnInvalidContent = z.infer<typeof MessageReturnInvalidContentSchema>;

export const CallOfferContentSchema = z.object({
  callId: z.string().uuid(),
  callType: CallType,
});

export type CallOfferContent = z.infer<typeof CallOfferContentSchema>;

export const CallAnswerContentSchema = z.object({
  callId: z.string().uuid(),
});

export type CallAnswerContent = z.infer<typeof CallAnswerContentSchema>;

export const CallRejectContentSchema = z.object({
  callId: z.string().uuid(),
});

export type CallRejectContent = z.infer<typeof CallRejectContentSchema>;

export const CallEndContentSchema = z.object({
  callId: z.string().uuid(),
});

export type CallEndContent = z.infer<typeof CallEndContentSchema>;

export const PeerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PING_SEND'), content: PingContentSchema }),
  z.object({ type: z.literal('PING_RECEIVE'), content: PingContentSchema }),
  z.object({ type: z.literal('MESSAGE_SEND'), content: MessageSchema }),
  z.object({ type: z.literal('MESSAGE_RETURN_RECEIVED'), content: MessageReturnReceivedContentSchema }),
  z.object({ type: z.literal('MESSAGE_RETURN_READ'), content: MessageReturnReadContentSchema }),
  z.object({ type: z.literal('MESSAGE_RETURN_INVALID'), content: MessageReturnInvalidContentSchema }),
  z.object({ type: z.literal('CALL_OFFER'), content: CallOfferContentSchema }),
  z.object({ type: z.literal('CALL_ANSWER'), content: CallAnswerContentSchema }),
  z.object({ type: z.literal('CALL_REJECT'), content: CallRejectContentSchema }),
  z.object({ type: z.literal('CALL_END'), content: CallEndContentSchema }),
]);

export type PeerMessage = z.infer<typeof PeerMessageSchema>;
