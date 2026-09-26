// Input schema for actions/support.ts. Client code imports the limits from lib/constants/support.ts.
import { z } from "zod";
import { SUPPORT_ERRORS, SUPPORT_LIMITS, SUPPORT_TOPIC_IDS } from "@/lib/constants/support";

export const supportRequestSchema = z.object({
  topic: z.enum(SUPPORT_TOPIC_IDS, { message: SUPPORT_ERRORS.topicRequired }),
  orderId: z
    .string()
    .trim()
    .max(40)
    .nullish()
    .transform((v) => v || null),
  subject: z.string().trim().min(1, SUPPORT_ERRORS.subjectRequired).max(SUPPORT_LIMITS.subjectMax, SUPPORT_ERRORS.subjectTooLong),
  message: z
    .string()
    .trim()
    .min(SUPPORT_LIMITS.messageMin, SUPPORT_ERRORS.messageTooShort)
    .max(SUPPORT_LIMITS.messageMax, SUPPORT_ERRORS.messageTooLong),
});
export type SupportRequestInput = z.infer<typeof supportRequestSchema>;
