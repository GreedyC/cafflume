import { z } from "zod";

const optionalDate = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.date().optional()
);

export const beanSchema = z.object({
  roaster: z.string().min(1, "Kavurucu zorunlu"),
  name: z.string().min(1, "Çekirdek adı zorunlu"),
  origin: z.string().min(1, "Menşei zorunlu"),
  variety: z.string().optional(),
  process: z.string().min(1, "İşlem zorunlu"),
  roastDate: z.coerce.date(),
  openDate: optionalDate,
  isFinished: z.boolean().default(false)
});

export const brewLogSchema = z
  .object({
    beanId: z.string().uuid("Çekirdek seçilmeli"),
    method: z.string().min(1, "Ekipman zorunlu"),
    doseGrams: z.number().positive(),
    yieldMl: z.number().positive(),
    waterTempC: z.number().min(50),
    grindSetting: z.string().min(1),
    brewTimeMin: z.number().int().min(0),
    brewTimeSec: z.number().int().min(0).max(59),
    rating: z.number().min(1).max(10),
    tastingNotes: z.string().optional()
  })
  .refine((data) => data.brewTimeMin + data.brewTimeSec > 0, {
    message: "Demleme süresi zorunlu",
    path: ["brewTimeMin"]
  });
