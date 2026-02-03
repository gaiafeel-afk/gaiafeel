import { z } from "zod";

export const completionPayloadSchema = z.object({
  responses: z
    .array(
      z.object({
        promptId: z.string().min(1),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .min(1),
  notes: z.string().max(5000).optional(),
  moodRating: z.number().int().min(1).max(10).optional(),
});

export const getStateInputSchema = z.object({
  timezone: z.string().min(1).optional(),
});

export const completeInputSchema = z.object({
  seqIndex: z.number().int().min(1),
  response: completionPayloadSchema,
});

export type GetStateInput = z.infer<typeof getStateInputSchema>;
export type CompleteInput = z.infer<typeof completeInputSchema>;
