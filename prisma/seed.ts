import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true") {
    throw new Error(
      "Seed mevcut verileri siler. Devam etmek için ALLOW_DESTRUCTIVE_SEED=true ayarla."
    );
  }

  await prisma.brewLog.deleteMany();
  await prisma.bean.deleteMany();
  const owner = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!owner) throw new Error("Seed için önce bir kullanıcı oluşturulmalı.");

  const bean1 = await prisma.bean.create({
    data: {
      userId: owner.id,
      roaster: "Null Coffee",
      name: "Colombia Finca El Paraiso",
      origin: "Colombia",
      variety: "Red Bourbon",
      process: "Anaerobic",
      roastDate: new Date("2026-05-10"),
      isFinished: false
    }
  });

  const bean2 = await prisma.bean.create({
    data: {
      userId: owner.id,
      roaster: "Wayta Coffee",
      name: "Peru Cajamarca",
      origin: "Peru",
      variety: "Geisha",
      process: "Washed",
      roastDate: new Date("2026-05-15"),
      isFinished: false
    }
  });

  await prisma.brewLog.create({
    data: {
      userId: owner.id,
      beanId: bean1.id,
      method: "Hario MUGEN",
      doseGrams: 16.0,
      yieldMl: 250.0,
      waterTempC: 93.0,
      grindSetting: "22 Clicks",
      brewTimeMin: 2,
      brewTimeSec: 30,
      rating: 9.4,
      tastingNotes: "Çilek ve yoğun kırmızı meyve profili, harika tatlılık."
    }
  });

  await prisma.brewLog.create({
    data: {
      userId: owner.id,
      beanId: bean2.id,
      method: "Hario Switch",
      doseGrams: 15.0,
      yieldMl: 240.0,
      waterTempC: 92.0,
      grindSetting: "20 Clicks",
      brewTimeMin: 3,
      brewTimeSec: 0,
      rating: 8.6,
      tastingNotes: "Yasemin ve çiçeksi notalar, temiz bir bitiş."
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
