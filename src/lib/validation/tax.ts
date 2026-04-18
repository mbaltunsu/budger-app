import { z } from "zod";

export const upsertTaxProfileSchema = z.object({
  country: z.string().min(2).max(10),
  taxMode: z.literal("MANUAL").default("MANUAL"),
  manualRateBps: z
    .number()
    .int("Must be an integer")
    .min(0, "Cannot be negative")
    .max(9999, "Cannot exceed 99.99%"),
});

export type UpsertTaxProfileInput = z.input<typeof upsertTaxProfileSchema>;
export type ParsedUpsertTaxProfile = z.output<typeof upsertTaxProfileSchema>;
