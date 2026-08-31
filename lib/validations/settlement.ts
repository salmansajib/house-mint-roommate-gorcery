import { z } from "zod";

export const settlementFormSchema = z
  .object({
    payer_id: z.string().min(1, "Please select who is paying"),
    receiver_id: z.string().min(1, "Please select who is receiving"),
    amount: z.coerce.number().positive("Settlement amount must be greater than ৳0"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().max(200).optional(),
  })
  .refine((data) => data.payer_id !== data.receiver_id, {
    message: "Payer and receiver cannot be the same person",
    path: ["receiver_id"],
  });

export type SettlementFormValues = z.infer<typeof settlementFormSchema>;
