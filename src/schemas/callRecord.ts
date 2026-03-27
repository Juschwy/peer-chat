import { z } from 'zod';

export const CallType = z.enum(['audio', 'video']);
export type CallType = z.infer<typeof CallType>;

export const CallStatus = z.enum(['missed', 'answered', 'rejected', 'outgoing']);
export type CallStatus = z.infer<typeof CallStatus>;

export const CallRecordSchema = z.object({
  id: z.string().uuid(),
  peerId: z.string().min(1),
  type: CallType,
  status: CallStatus,
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  direction: z.enum(['inbound', 'outbound']),
});

export type CallRecord = z.infer<typeof CallRecordSchema>;
