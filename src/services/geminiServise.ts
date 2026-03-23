// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { s3Client, BUCKET_NAME } from "../config/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// S3'ten dosya okuma fonksiyonu
async function getFileFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const byteArray = await response.Body?.transformToByteArray();
  return Buffer.from(byteArray!);
}

export const analyzeImageWithGemini = async (s3Key: string) => {
  try {
    // 1. Modeli seç (Gemini 1.5 Flash hem hızlı hem ucuzdur)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. S3'ten görseli çek
    const imageBuffer = await getFileFromS3(s3Key);

    // 3. Görseli Gemini'ın anlayacağı formata çevir
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg", // Dinamik hale getirilebilir
      },
    };

    // 4. Prompt (Yapay zekaya ne yapacağını söyle)
    const prompt = `
      Sen profesyonel bir moda stilistisin. Bu fotoğraftaki kıyafeti analiz et ve şu bilgileri JSON formatında döndür:
      - category: (Örn: Üst Giyim, Alt Giyim, Ayakkabı, Aksesuar)
      - subCategory: (Örn: Ceket, Jean, Sneaker, Saat)
      - color: (Ana renk)
      - material: (Örn: Kot, Pamuk, Deri)
      - style: (Örn: Casual, Klasik, Spor, Bohem)
      - description: (Kısa bir açıklama cümlesi)
    `;

    // 5. Yanıtı al
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Analiz Hatası:", error);
    throw new Error("Yapay zeka analiz yaparken bir sorunla karşılaştı.");
  }
};