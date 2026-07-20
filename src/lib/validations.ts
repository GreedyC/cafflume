import { z } from "zod";

const dateStringPattern =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/u;

const strictDate = z
  .union([z.date(), z.string().trim().max(40).regex(dateStringPattern)])
  .refine((value) => {
    if (value instanceof Date) {
      return !Number.isNaN(value.getTime());
    }
    const parsed = new Date(value);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value.slice(0, 10)
    );
  }, "Geçersiz tarih")
  .transform((value) => (value instanceof Date ? value : new Date(value)));

const optionalDate = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  strictDate.optional()
);

const requiredShortText = (message: string, maxLength = 120) =>
  z.string().trim().min(1, message).max(maxLength, "Alan çok uzun");

export const idSchema = z.string().uuid("Geçersiz kayıt kimliği");

export const pageSchema = z.coerce.number().int().min(1).max(10_000);

export const beanStatusSchema = z
  .object({
    isFinished: z.boolean()
  })
  .strict();

export const beanSchema = z
  .object({
    roaster: requiredShortText("Kavurucu zorunlu"),
    name: requiredShortText("Çekirdek adı zorunlu"),
    origin: requiredShortText("Menşei zorunlu", 80),
    variety: z.string().trim().max(120, "Varyete çok uzun").optional(),
    process: requiredShortText("İşlem zorunlu", 80),
    roastDate: strictDate,
    openDate: optionalDate,
    isFinished: z.boolean().default(false)
  })
  .strict()
  .superRefine((data, context) => {
    if (data.openDate && data.openDate < data.roastDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Açılış tarihi kavrum tarihinden önce olamaz",
        path: ["openDate"]
      });
    }
  });

export const brewLogSchema = z
  .object({
    beanId: idSchema,
    method: requiredShortText("Ekipman zorunlu", 80),
    doseGrams: z.number().finite().positive().max(500),
    yieldMl: z.number().finite().positive().max(5_000),
    waterTempC: z.number().finite().min(50).max(100),
    grindSetting: requiredShortText("Öğütüm ayarı zorunlu", 120),
    brewTimeMin: z.number().finite().int().min(0).max(1_440),
    brewTimeSec: z.number().finite().int().min(0).max(59),
    rating: z.number().finite().min(1).max(10),
    tastingNotes: z
      .string()
      .trim()
      .max(2_000, "Tadım notu çok uzun")
      .optional()
  })
  .strict()
  .refine((data) => data.brewTimeMin + data.brewTimeSec > 0, {
    message: "Demleme süresi zorunlu",
    path: ["brewTimeMin"]
  });
